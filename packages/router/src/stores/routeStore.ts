import { createStore, getStoreData } from "@vermi/core";
import { type Class, format } from "@vermi/utils";
import type { HttpMethod } from "../enums";
import type { FullPath, Operation, Routes, SlashedPath } from "../interfaces";

export const RouterMetadataKey: unique symbol = Symbol("Router");

export type RouterAPI = {
	findPath(
		controller: Class<any>,
		actionName: string | symbol,
	): FullPath | undefined;
	addRoute(
		method: HttpMethod,
		path: SlashedPath,
		propertyKey: string,
		routeMetadata?: Pick<Operation, "args" | "responses">,
	): Routes["paths"];
	updateRoute(path: FullPath, updater: (current: Operation) => Operation): void;
	updatePathPrefix(prefix: { [key: string]: SlashedPath }):
		| Routes["paths"]
		| undefined;
};

export const routeStore = createStore<Routes["paths"], RouterAPI>(
	RouterMetadataKey,
	(target, get, set) => ({
		findPath(controller: Class<any>, actionName: string | symbol) {
			const current = get();
			if (!current) return;
			const key = `${controller.name}.${actionName.toString()}`;
			for (const [path, { handler }] of current) {
				const opId = `${handler.target.name}.${handler.action}`;
				if (opId === key) return path;
			}
		},
		addRoute(method, path, propertyKey, { args } = {}) {
			const current = get() || new Map<FullPath, Operation>();

			const full = `${method}${path}` as FullPath;

			current.set(full, {
				handler: {
					target,
					action: propertyKey,
				},
				args,
			});

			set(current);
			return current;
		},
		updateRoute(path, updater) {
			const current = get();
			const route = current?.get(path);

			if (!route || !current) return;

			current.set(path, updater(route));

			set(current);
		},
		updatePathPrefix(prefix) {
			const current = get();
			if (!current) return;
			const updated = new Map<FullPath, Operation>();
			for (const [key, operation] of current) {
				const newKey = format(key, prefix, true);
				updated.set(newKey as FullPath, operation);
			}
			set(updated);
			return updated;
		},
	}),
	() => new Map(),
);

export const getRoutes = () => {
	return getStoreData<Routes["paths"]>(RouterMetadataKey);
};