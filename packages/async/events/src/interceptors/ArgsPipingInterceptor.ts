import { Interceptor, type InterceptorMethods } from "@vermi/core";
import type { MaybePromiseFunction } from "@vermi/utils";
import type { EventContext } from "../interfaces";

@Interceptor()
export class ArgsPipingInterceptor<Context extends EventContext<any, any>>
	implements InterceptorMethods<Context>
{
	async intercept(context: Context, next: MaybePromiseFunction) {
		return next(context);
		// console.log(context);
		// const payload = context.store.event.payload;
		// const args = context.store.route.args;
		// if (!args?.length) {
		// 	return next(context);
		// }

		// const values: any[] = [];

		// for (const arg of args) {
		// 	let value = payload[arg.in];

		// 	if (arg.pipes) {
		// 		for (const pipe of arg.pipes) {
		// 			value = await context.build<any>(pipe).map(value);
		// 		}
		// 	}

		// 	values.push(value);
		// }
		// return next(...values);
	}
}
