import { type RadixRouter, createRouter } from "radix3";
import type { Dictionary } from "./object";
import { parseQuery, pathname, searchString } from "./url";

export * from "radix3";

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type Matched<Data> = {
	searchParams: Dictionary<string>;
	store: Data;
};

export class Router<Data extends Dictionary> {
	#router: Map<string, RadixRouter<Matched<Data>>> = new Map();

	add(method: HTTPMethod, path: string, data: Data) {
		const routeData: Matched<Data> = {
			searchParams: {},
			store: data,
		};
		if (!this.#router.get(method)) {
			this.#router.set(method, createRouter({ routes: { [path]: routeData } }));
		}
		this.#router.get(method)?.insert(path, routeData);
	}

	find(method: string, path: string) {
		return this.#router.get(method)?.lookup(path) ?? null;
	}

	lookup(request: Request) {
		const method = request.method.toUpperCase();
		const route = this.find(method, pathname(request.url));

		if (!route) {
			return null;
		}

		route.searchParams = parseQuery(searchString(request.url));

		return route;
	}
}
