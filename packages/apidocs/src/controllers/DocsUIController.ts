import { UseCache } from "@vermi/cache";
import { Config, Inject, type RequestContext } from "@vermi/core";
import { Remix } from "@vermi/remix";
import { Controller, Get, NotFound, Use } from "@vermi/router";
import type { ApiDocsConfig } from "../ApiDocsModule";
import type { ApiConfig } from "../interfaces";
import { ServiceFactoryMiddleware } from "../middlewares/ServiceFactory";
import { BaseAPIService } from "../services";

@Controller("/")
export class DocsUIController {
	@Config("ApiDocsModule") private config!: ApiDocsConfig;
	@Inject("apiService") private apiService!: BaseAPIService<any>;

	protected getConfig(ctx: RequestContext) {
		const id = ctx.store.route.mount ?? "/";
		if (!Object.keys(this.config).includes(id)) {
			throw new NotFound(`No API Docs config found for ${id}`);
		}
		return {
			...this.config[id as keyof ApiDocsConfig],
			id,
		};
	}

	@UseCache()
	buildSpecs(serverUrl: string, config: ApiConfig) {
		return this.apiService.buildSpecs({
			serverUrl,
			title: config.title || `API Docs for ${config.type}`,
			casing: config.casing,
		});
	}

	@Use(ServiceFactoryMiddleware)
	@Get("/specs.json")
	async getDocs(ctx: RequestContext) {
		return this.buildSpecs(ctx.store.serverUrl, this.getConfig(ctx));
	}

	@Remix()
	@Get("/")
	async renderDoc(ctx: RequestContext) {
		const conf = this.getConfig(ctx);
		return {
			specsUrl: `${conf.id}/specs.json`,
			type: conf.type,
		};
	}
}
