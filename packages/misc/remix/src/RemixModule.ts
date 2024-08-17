import {
	type RequestHandler,
	type ServerBuild,
	createRequestHandler,
} from "@remix-run/server-runtime";
import {
	type AppContext,
	AppHook,
	Config,
	Configuration,
	Module,
	VermiModule,
	asValue,
} from "@vermi/core";
import { statics } from "@vermi/static";

declare module "@vermi/core" {
	interface _AppContext {
		remix: RequestHandler;
	}
}

export interface RemixModuleOptions {
	build: string;
	assets: string;
}

@Module()
export class RemixModule extends VermiModule<RemixModuleOptions> {
	@Config() config!: RemixModuleOptions;

	constructor(protected configuration: Configuration) {
		super();
	}

	@AppHook("app:init")
	async init(context: AppContext) {
		const buildPath = Bun.fileURLToPath(this.config.build);
		const handler = createRequestHandler(
			(await import(buildPath)) as ServerBuild,
		);
		context.register("remix", asValue(handler));

		// remove last segment of the path
		const assets = Bun.fileURLToPath(this.config.assets).replace(
			/\/[^/]+$/,
			"",
		);

		this.use(statics(assets, { patterns: [/^\/assets\//] }));
	}
}
