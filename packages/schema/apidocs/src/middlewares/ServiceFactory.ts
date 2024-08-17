import { Config, Middleware, type RequestContext, asValue } from "@vermi/core";
import { Matched, NotFound } from "@vermi/router";
import type { ApiDocsConfig } from "../ApiDocsModule";
import { AsyncAPIService, OpenAPIService } from "../services";
import { isOpenAPI } from "../utils/isOpenAPI";

@Middleware()
export class ServiceFactoryMiddleware {
	@Config("ApiDocsModule") private config!: ApiDocsConfig;

	@Matched()
	async beforeRoute(ctx: RequestContext) {
		const id = ctx.store.route.mount ?? "/";
		const config = this.config.find((c) => c.mount === id);
		if (!config) {
			throw new NotFound(`No API Docs config found for ${id}`);
		}

		const service = isOpenAPI(config)
			? new OpenAPIService(config)
			: new AsyncAPIService(config);

		ctx.register("apiService", asValue(service));
	}
}
