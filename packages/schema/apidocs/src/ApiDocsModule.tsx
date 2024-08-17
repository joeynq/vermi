import {
	type AppContext,
	AppHook,
	Config,
	Configuration,
	Logger,
	type LoggerAdapter,
	Module,
	VermiModule,
} from "@vermi/core";
import { router } from "@vermi/router";
import type { Server } from "bun";
import { DocsUIController } from "./controllers";
import type { ApiConfig } from "./interfaces";
import type { SecuritySchemeObject } from "./interfaces/OpenAPI";

type AuthConfig = { scheme: Record<string, SecuritySchemeObject> }[];

export type ApiDocsConfig = ApiConfig[];

@Module()
export class ApiDocsModule extends VermiModule<ApiDocsConfig> {
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: ApiDocsConfig;
	@Config("AuthModule") public authConfig?: AuthConfig;

	baseUrl = "";

	constructor(protected configuration: Configuration) {
		super();
	}

	@AppHook("app:started")
	async started(_: AppContext, server: Server) {
		this.baseUrl = server.url.toString().replace(/\/$/, "");

		for (const config of this.config) {
			const conf = config as ApiConfig;
			this.logger.info(
				"{0} Specs: {1}",
				conf.type,
				`${this.baseUrl}${config.mount}/specs.json`,
			);
		}
	}

	@AppHook("app:init")
	async init() {
		const authConfig = this.authConfig;
		let schemes: Record<string, SecuritySchemeObject> | undefined = undefined;
		if (authConfig) {
			schemes = this.authConfig?.reduce(
				// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
				(acc, { scheme }) => ({ ...acc, ...scheme }),
				{} as Record<string, SecuritySchemeObject>,
			);
		}

		for (const { mount } of this.config) {
			this.use(router(mount, [DocsUIController]));
		}

		// for (const [_, config] of Object.entries(this.config)) {
		// 	const conf = config as ApiConfig;

		// 	if (schemes) {
		// 		isOpenAPI(conf)
		// 			? this.openApiService.addSecuritySchemes(schemes)
		// 			: this.asyncApiService.addSecuritySchemes(schemes);
		// 	}
		// }
	}
}
