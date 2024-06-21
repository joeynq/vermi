import {
	Config,
	Middleware,
	type RequestContext,
	Use,
	asValue,
} from "@vermi/core";
import { stringify } from "@vermi/utils";
import type { RouterModuleConfig } from "../RouterModule";
import { AfterRoute, BeforeRoute } from "../decorators";
import { type CasingType, casingFactory } from "../services";

const getCasing = (context: RequestContext, config: RouterModuleConfig) => {
	const mount = context.store.route?.mount;

	if (!mount) {
		return {
			internal: "camel" as const,
			interfaces: undefined,
		};
	}

	const cnf = config.find((c) => c.mount === mount)?.options;

	const internal = cnf?.casing?.internal ?? "camel";
	const interfaces = cnf?.casing?.interfaces;

	return { internal, interfaces };
};

@Middleware()
class CasingMiddleware {
	@Config("RouterModule") config!: RouterModuleConfig;

	shouldProcess(
		internal: CasingType,
		interfaces?: CasingType,
	): interfaces is CasingType {
		return !!interfaces && interfaces !== internal;
	}

	@BeforeRoute()
	async payloadCasing(context: RequestContext) {
		const { internal, interfaces } = getCasing(context, this.config);

		if (!this.shouldProcess(internal, interfaces)) {
			return;
		}

		const service = casingFactory(internal);
		const { query, body, header, cookie } = context.store.payload;

		context.register(
			"payload",
			asValue({
				query: query ? service.convert(query) : undefined,
				body: body ? service.convert(JSON.parse(body)) : undefined,
				header: service.convert(header),
				cookie: service.convert(cookie),
			}),
		);
	}

	@AfterRoute()
	async responseCasing(context: RequestContext, response: Response) {
		const { internal, interfaces } = getCasing(context, this.config);

		if (!this.shouldProcess(internal, interfaces)) {
			return;
		}

		const service = casingFactory(interfaces);

		const body = await response.json();

		return new Response(stringify(service.convert(body as object)), {
			status: response.status,
			headers: response.headers,
		});
	}
}

export const Casing = () => Use(CasingMiddleware);
