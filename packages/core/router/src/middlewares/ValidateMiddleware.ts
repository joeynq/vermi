import { Middleware, type RequestContext, Use } from "@vermi/core";
import type { ValidationFn } from "@vermi/schema";
import type { MatchedRoute } from "@vermi/utils";
import { Guard } from "../decorators";
import { BadRequest } from "../exceptions";
import type { RouteMatch } from "../interfaces";

@Middleware()
export class ValidateMiddleware {
	@Guard()
	/**
	 * This function validates the payload data against the specified schema and checks for missing
	 * required parameters.
	 * @param {RequestContext} context - The `context` parameter in the `validate` function represents the
	 * request context, which contains information about the current request being processed. It includes
	 * data such as the request payload, store, and any other relevant information needed for validation.
	 * @param route - The `route` parameter in the `validate` function is of type
	 * `FindResult<RouteMatch>`. This means it is a result of finding a matching route, which contains
	 * information about the route such as the route itself and any associated metadata.
	 * @returns If the `args` array is empty or if the `validator` function is not available, the function
	 * will return early without performing any validation.
	 */
	async validate(context: RequestContext, route: MatchedRoute<RouteMatch>) {
		const payload = context.store.payload;
		const args = context.store.route.args;
		const validator = context.resolve<ValidationFn>("validator");

		if (!args?.length || !validator) {
			return;
		}

		for (const arg of args) {
			const value = payload[arg.in];

			if (arg.required && value === undefined) {
				throw new BadRequest(`Missing required parameter: ${arg.name}`);
			}

			if (arg.schema && value !== undefined) {
				await validator(arg.schema, value);
			}
		}
	}
}

export const Validator = () => Use(ValidateMiddleware);
