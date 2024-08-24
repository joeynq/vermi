import {
	type AppContext,
	AppEvents,
	Config,
	Hook,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	asValue,
	registerHooks,
	registerProviders,
} from "@vermi/core";
import { type ValidationFn, validate } from "@vermi/schema";
import { type Class, ensure } from "@vermi/utils";
import { RouterEvents } from "./events";
import type { HTTPMethod, RouteMatch, SlashedPath } from "./interfaces";
import { type CasingType, Router } from "./services";
import { type ControllerRoutes, addRoutes, routeStore } from "./stores";
import { defaultErrorHandler, defaultResponseHandler } from "./utils";

declare module "@vermi/core" {
	interface _RequestContext {
		route: RouteMatch;
		payload: {
			path?: any;
			query?: any;
			body?: any;
			header?: any;
			cookie?: any;
		};
	}
}

export type RouterOptions = {
	middlewares?: Class<any>[];
	customValidation?: ValidationFn;
	errorHandler?: (
		error: Error,
		responses?: RouteMatch["responses"],
	) => Response;
	responseHandler?: <T>(
		result: T,
		responses?: RouteMatch["responses"],
	) => Response;
	casing?: {
		interfaces?: CasingType; // query, body, params
		internal?: CasingType;
	};
};

export type RouterModuleConfig = {
	mount: SlashedPath;
	controllers: Class<any>[];
	options?: RouterOptions;
};

@Module({ deps: [Router] })
export class RouterModule extends VermiModule<RouterModuleConfig> {
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: RouterModuleConfig[];

	constructor(protected router: Router) {
		super();
	}

	#addRoutes(
		context: AppContext,
		mount: SlashedPath,
		metadata: ControllerRoutes,
	) {
		const { prefix, args, className, routes } = metadata;
		addRoutes(mount, metadata);

		for (const { path, method, propertyKey, metadata } of routes) {
			// replace double slashes with single slashes
			const route = `${mount}${prefix}${path}`
				.replace(/\/+/g, "/")
				.replace(/\/$/, "");

			const instance = context.resolve<any>(className);
			const thisArgs = args
				.filter((a) => a.propertyKey === propertyKey)
				.toSorted((a, b) => a.parameterIndex - b.parameterIndex)
				.map((a) => a.arg);

			const handler = (...args: any) => instance[propertyKey](...args);
			Object.defineProperty(handler, "name", {
				value: `${className}.${propertyKey.toString()}`,
				writable: true,
			});

			this.router.addRoute(method as HTTPMethod, route, {
				handler,
				path: route,
				args: thisArgs,
				mount,
				method: method as HTTPMethod,
				responses: metadata.responses,
				security: metadata.security,
			});
		}
	}

	@Hook(AppEvents.OnInit)
	initRoute(context: AppContext) {
		const mounted = this.config;

		ensure(mounted, "No configuration provided");

		for (const { controllers } of mounted) {
			ensure(controllers.length > 0, "No controllers provided");
		}

		const all = mounted.flatMap((m) => m.controllers);
		registerProviders(...all);

		for (const { mount, controllers } of mounted) {
			for (const controller of controllers) {
				const routeConf = routeStore.apply(controller).get();
				this.#addRoutes(context, mount as SlashedPath, routeConf);
			}
		}

		registerHooks(context, ...all);
	}

	@Hook("app:request")
	async onRequest(context: RequestContext) {
		const match = await this.router.match();
		if (!match) {
			return;
		}

		const mount = match.store.mount;
		ensure(mount, "No mount found for route");

		const config = this.config.find((c) => c.mount === mount);

		if (!config) {
			return;
		}

		const {
			errorHandler = defaultErrorHandler,
			responseHandler = defaultResponseHandler,
			customValidation = validate,
		} = config.options || {};

		const { request, logger } = context.store;
		const { responses } = match.store;

		try {
			this.logger.info(`Request received: ${context.store.request.url}`);

			context.register("validator", asValue(customValidation));

			let response: Response | undefined = undefined;

			response = await this.router.invoke(RouterEvents.Match, context);
			if (response) return responseHandler(response);

			response = await this.router.invoke(RouterEvents.BeforeRoute, context);
			if (response) return responseHandler(response);

			const result = await this.router.handleRequest();

			response = responseHandler(result, responses);

			const newResponse = await this.router.invoke(
				RouterEvents.AfterRoute,
				context,
				response,
			);

			return newResponse || response;
		} catch (err) {
			const error = err as Error;
			logger.error(error, `${request.method} ${request.url} failed`);
			return errorHandler(error, responses);
		}
	}
}
