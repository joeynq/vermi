import { Intercept, useDecorators } from "@vermi/core";
import { ArgsPipingInterceptor } from "../interceptors";
import type { HTTPMethod, SlashedPath } from "../interfaces";
import { Casing, Validator } from "../middlewares";
import { routeStore } from "../stores";

export interface ActionOptions {
	operationId?: string;
}

export const Action = (
	method: HTTPMethod,
	path: SlashedPath,
	options: ActionOptions = {},
): MethodDecorator => {
	return useDecorators(
		(target: any, propertyKey: string | symbol) => {
			routeStore
				.apply(target.constructor)
				.addRoute(method, path, propertyKey, options.operationId);
		},
		Intercept(ArgsPipingInterceptor),
		Casing(),
		Validator(),
	);
};
