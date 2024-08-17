import {
	Config,
	type ContextService,
	Injectable,
	type RequestContext,
	asValue,
} from "@vermi/core";
import { Router as RadixRouter, ensure, getCookies } from "@vermi/utils";
import type { RouterModuleConfig } from "../RouterModule";
import { RouterEvents } from "../events";
import type { HTTPMethod, RouteMatch } from "../interfaces";

@Injectable("SINGLETON")
export class Router {
	protected router = new RadixRouter<RouteMatch>();

	@Config("RouterModule") config!: RouterModuleConfig;

	get context() {
		ensure(this.contextService.context);
		return this.contextService.context.expose() as RequestContext;
	}

	constructor(private contextService: ContextService) {}

	async match() {
		const request = this.context.resolve<Request>("request");
		const match = this.router.lookup(request);

		if (!match) {
			return;
		}

		const contentType = request.headers.get("content-type");

		let body: any = undefined;
		switch (contentType) {
			case "application/json": {
				const text = await request.text();
				body = text ? JSON.parse(text) : undefined;
				break;
			}
			case "application/x-www-form-urlencoded":
				body = await request.formData();
				break;
			default:
				body = await request.text();
				break;
		}

		this.context.register({
			route: asValue(match.store),
			payload: asValue({
				body,
				query: match.searchParams,
				params: match.params,
				headers: Object.fromEntries(request.headers),
				cookies: getCookies(request.headers.get("cookie") || ""),
			}),
		});

		return match;
	}

	addRoute(method: HTTPMethod, path: string, store: RouteMatch) {
		this.router.add(method, path, store);
		return store;
	}

	async invoke(event: RouterEvents, ...data: any[]) {
		const {
			hooks,
			route: { mount, handler },
		} = this.context.store;

		// invoke global hooks first
		let response = await hooks.invoke(event, data, {
			when: (scope: string) => {
				return !mount || scope === mount;
			},
			breakOn: (result: any | undefined) => result instanceof Response,
		});

		if (response instanceof Response) {
			return response;
		}

		// invoke route hooks
		response = await hooks.invoke(event, data, {
			when: (scope: string) => handler.name === scope,
			breakOn: (result: any | undefined) => result instanceof Response,
		});

		if (response instanceof Response) {
			return response;
		}
	}

	async handleRequest() {
		const context = this.context;

		let response: any = undefined;

		// on route guard
		response = await this.invoke(RouterEvents.Guard, context);
		if (response) {
			return response;
		}

		// before route handle
		response = await this.invoke(RouterEvents.BeforeHandle, context);
		if (response) {
			return response;
		}

		const result = context.store.route.handler(context);

		response = await this.invoke(RouterEvents.AfterHandle, context, result);

		return response || result;
	}
}
