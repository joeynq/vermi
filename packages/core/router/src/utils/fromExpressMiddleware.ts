import { Middleware, type RequestContext, hookStore } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { RouterEvents } from "../events";
import { type ExpressMiddleware, promiseMiddleware } from "./promiseMiddleware";

/**
 * The function `fromExpress` converts an Express middleware function into a Middleware class for a
 * specific RouterEvents.
 * @param {ExpressMiddleware} expressMiddleware - The `expressMiddleware` parameter is a middleware
 * function from the Express.js framework that you want to adapt to be used as a middleware in another
 * framework or system.
 * @returns `ExpressMiddlewareAdapter` that implements the `Middleware` interface.
 * @example
 * ```ts
 * import { fromExpress } from "@vermi/router";
 * import { Middleware } from "@vermi/core";
 * import theExpressMiddleware from "express-middleware";
 *
 * class UserController {
 *  @Get("/")
 *  @Middleware(fromExpress(theExpressMiddleware))
 *  async getUser() {
 *    // Your code here
 *  }
 * }
 * ```
 */
export const fromExpressMiddleware = (
	expressMiddleware: ExpressMiddleware,
	name: string,
	event: string = RouterEvents.BeforeHandle,
): Class<any> => {
	const ExpressMiddlewareAdapter = class {
		#expressMiddleware = expressMiddleware;

		async run(context: RequestContext) {
			const middleware = promiseMiddleware.bind(null, context.store.request);

			const result = await middleware(this.#expressMiddleware);
			// if (result) {
			// 	console.log(result);
			// 	return result;
			// }
		}
	};

	Object.defineProperty(ExpressMiddlewareAdapter, "name", {
		value: name,
	});

	hookStore.apply(ExpressMiddlewareAdapter).addHandler(event, {
		target: ExpressMiddlewareAdapter,
		handler: new ExpressMiddlewareAdapter().run as any,
	});

	Middleware()(ExpressMiddlewareAdapter);

	return ExpressMiddlewareAdapter;
};
