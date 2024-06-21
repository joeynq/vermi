import type { ValidationFn } from "@vermi/schema";
import type { Class, HTTPMethod, MaybePromiseFunction } from "@vermi/utils";
import type { Operation, SlashedPath } from "./schema";

export type { HTTPMethod };

export type RouterConfig = {
	middlewares?: Class<any>[];
	customValidation?: ValidationFn;
	errorHandler?: (error: Error, responses?: Operation["responses"]) => Response;
	responseHandler?: <T>(
		result: T,
		responses?: Operation["responses"],
	) => Response;
	routes: { [key: SlashedPath]: Operation[] };
};

export type RouteMatch = Omit<Operation, "handler"> & {
	handler: MaybePromiseFunction;
	path: string;
	method: HTTPMethod;
};
