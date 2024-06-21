import {
	Interceptor,
	type InterceptorMethods,
	type RequestContext,
} from "@vermi/core";
import type { MaybePromiseFunction } from "@vermi/utils";

@Interceptor()
export class ArgsPipingInterceptor
	implements InterceptorMethods<RequestContext>
{
	async intercept(context: RequestContext, next: MaybePromiseFunction) {
		const payload = context.store.payload;
		const args = context.store.route.args;
		if (!args?.length) {
			return next(context);
		}

		const values: any[] = [];

		for (const arg of args) {
			let value = payload[arg.in];

			if (arg.pipes) {
				for (const pipe of arg.pipes) {
					value = await context.build(pipe).map(value);
				}
			}

			values.push(value);
		}
		return next(...values);
	}
}
