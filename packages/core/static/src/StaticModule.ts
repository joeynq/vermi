import { type CacheAdapter } from "@vermi/cache";
import {
	type AppContext,
	AppHook,
	Config,
	HttpException,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
} from "@vermi/core";
import { pathname } from "@vermi/utils";
import type { BunFile } from "bun";
import { generateETag, isCached } from "./utils";

export type SlashedPath = `/${string}`;

export type StaticModuleOptions = {
	assetsDir: string;
	patterns?: (string | RegExp)[];
	cache?: string;
	extensions?: string[];
	immutable?: boolean;
	maxAge?: number;
	eTag?: boolean;
	index?: string;
};

const defaultStaticExtensions = [
	".html",
	".js",
	".css",
	".json",
	".png",
	".jpg",
	".jpeg",
	".gif",
	".svg",
	".ico",
	".webp",
	".woff",
	".woff2",
	".ttf",
	".eot",
	".otf",
];

interface StaticCache {
	path: string;
	config: StaticModuleOptions;
}

@Module()
export class StaticModule extends VermiModule<StaticModuleOptions> {
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: StaticModuleOptions[];

	#getHeaders(config: StaticModuleOptions, etag?: string) {
		const { immutable, maxAge } = config;
		const headers = new Headers();

		let cacheControl = "no-cache";
		if (maxAge) {
			cacheControl = `public, max-age=${maxAge}`;
		}
		if (immutable) {
			cacheControl += ", immutable";
		}
		headers.set("Cache-Control", cacheControl);

		if (etag) {
			headers.set("ETag", etag);
		}

		return headers;
	}

	@AppHook("app:init")
	public async onInit(context: AppContext) {
		for (const { assetsDir, cache } of this.config) {
			if (cache) {
				context.register("static:cache", {
					resolve: (ctx) => {
						return ctx.resolve<CacheAdapter<any>>(cache);
					},
				});
			}
			this.logger.info(`StaticModule initialized. ${assetsDir}`);
		}
	}

	async lookup(
		context: RequestContext,
	): Promise<[BunFile, StaticModuleOptions] | undefined> {
		const requestUrl = context.store.request.url;
		const cache = context.resolve<CacheAdapter<any>>("static:cache");

		const cached = await cache?.get<StaticCache>(requestUrl);

		if (cached) {
			const file = Bun.file(cached.path);
			if (await file.exists()) {
				return [file, cached.config];
			}
			await cache?.delete(requestUrl);
		}

		let relPath = pathname(requestUrl);
		let ext = relPath.split(".").pop();

		const isAbsolute = (assetsDir: string) => assetsDir.startsWith("/");

		const findFile = async (assetsDir: string) => {
			const conf = this.config.find((c) => c.assetsDir === assetsDir);
			if (!conf) {
				return;
			}
			const indexFile = conf.index ?? "index.html";
			const allowedExtensions = conf.extensions ?? defaultStaticExtensions;
			if (!ext) {
				relPath += `/${indexFile}`;
				ext = relPath.split(".").pop();
			}
			if (!ext || !allowedExtensions.includes(`.${ext}`)) {
				return;
			}

			const filePath = isAbsolute(assetsDir)
				? `${assetsDir}${relPath}`
				: `${process.cwd()}${assetsDir}${relPath}`;
			const file = Bun.file(filePath);
			if (await file.exists()) {
				await cache?.set(requestUrl, { path: filePath, config: conf });
				return file;
			}
		};

		for (const { patterns, ...rest } of this.config) {
			if (!patterns?.length) {
				const file = await findFile(rest.assetsDir);
				if (file) {
					return [file, rest];
				}
				continue;
			}

			const isMatch = patterns.some((pattern) =>
				new RegExp(pattern).test(relPath),
			);
			if (!isMatch) {
				continue;
			}
			const file = await findFile(rest.assetsDir);
			if (file) {
				return [file, rest];
			}
		}
	}

	@AppHook("app:request")
	public async onRequest(context: RequestContext) {
		try {
			const { request } = context.store;

			const found = await this.lookup(context);

			if (!found) {
				return;
			}
			const [file, config] = found;
			const mtime = file.lastModified;

			const etag = config.eTag ? await generateETag(mtime) : undefined;

			if (etag && (await isCached(request.headers, etag, mtime))) {
				return new Response(null, { status: 304 });
			}

			return new Response(file, { headers: this.#getHeaders(config, etag) });
		} catch (err) {
			const error = err as Error;
			this.logger.error(error.message, error);
			return new HttpException(500, error.message, error).toResponse();
		}
	}
}
