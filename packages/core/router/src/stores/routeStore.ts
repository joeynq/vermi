import { type HttpCodes, createStore } from "@vermi/core";
import type {
	HTTPMethod,
	Parameter,
	RequestBody,
	Response,
	Routes,
	SlashedPath,
} from "../interfaces";

export const RouterMetadataKey: unique symbol = Symbol("Router");

interface Route {
	method: HTTPMethod;
	path: SlashedPath;
	propertyKey: string | symbol; // not a key
	metadata: {
		operationId?: string;
		responses: Map<HttpCodes, Response>;
		security: Map<string, string[]>;
	};
}

interface Arg {
	propertyKey: string | symbol;
	arg: Parameter | RequestBody;
	parameterIndex: number;
}

export interface ControllerRoutes {
	prefix: SlashedPath;
	className: string;
	routes: Route[];
	args: Arg[];
}

export type RouterAPI = {
	setPrefix(prefix: SlashedPath): void;
	addRoute(
		method: HTTPMethod,
		path: SlashedPath,
		propertyKey: string | symbol,
		operationId?: string,
	): void;
	addArg(
		propertyKey: string | symbol,
		parameterIndex: number,
		arg: Parameter | RequestBody,
	): void;
	updateRoute(
		propertyKey: string | symbol,
		updater: (route: Route) => Route,
	): void;
};

export const routeStore = createStore<ControllerRoutes, RouterAPI>(
	RouterMetadataKey,
	(target, get, set) => ({
		setPrefix(prefix) {
			const current = get();
			current.prefix = prefix;
			current.className = target.name;
			set(current);
		},
		addRoute(method, path, propertyKey, operationId) {
			const current = get();
			const existing = current.routes.find(
				(route) => route.path === path && route.method === method,
			);
			if (existing?.propertyKey && existing?.propertyKey !== propertyKey) {
				throw new Error(
					`Duplicate route found for ${method} ${path} in ${current.className}`,
				);
			}
			if (existing) {
				return;
			}

			current.routes.push({
				method,
				path,
				propertyKey,
				metadata: {
					responses: new Map(),
					security: new Map(),
					operationId: operationId,
				},
			});

			set(current);
		},
		updateRoute(propertyKey, updater) {
			const current = get();

			for (const index in current.routes) {
				const route = current.routes[index];
				if (route.propertyKey === propertyKey) {
					current.routes[index] = updater(route);
				}
			}

			set(current);
		},
		addArg(propertyKey, parameterIndex, arg) {
			const current = get();

			const existing = current.args.find(
				(arg) =>
					arg.propertyKey === propertyKey &&
					arg.parameterIndex === parameterIndex,
			);

			if (existing) {
				return;
			}

			current.args.push({
				propertyKey,
				parameterIndex,
				arg,
			});

			set(current);
		},
	}),
	() => ({
		prefix: "/",
		className: "",
		routes: [],
		args: [],
	}),
);

const routes: Routes["paths"] = new Map();

export const getRoutes = (mounts: SlashedPath[] = []) => {
	if (!mounts.length) {
		return routes;
	}

	const mounted = new Map();

	for (const mount of mounts) {
		for (const [key, value] of routes) {
			if (value.mount === mount) {
				mounted.set(key, value);
			}
		}
	}

	return mounted;
};

export const addRoutes = (mount: SlashedPath, metadata: ControllerRoutes) => {
	const args = metadata.args;
	for (const {
		path,
		method,
		propertyKey,
		metadata: { responses, security, operationId },
	} of metadata.routes) {
		const route = `${mount}${metadata.prefix}${path}`
			.replace(/\/+/g, "/")
			.replace(/\/$/, "");
		const key = `${method}${route}` as `${HTTPMethod}${SlashedPath}`;

		if (routes.has(key)) {
			return;
		}

		routes.set(key, {
			handler: {
				action: propertyKey.toString(),
				target: metadata.className,
			},
			args: args.filter((a) => a.propertyKey === propertyKey).map((a) => a.arg),
			operationId,
			responses,
			security,
			mount,
		});
	}
};
