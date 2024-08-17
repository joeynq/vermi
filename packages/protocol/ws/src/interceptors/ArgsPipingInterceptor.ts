import { Interceptor, type InterceptorMethods } from "@vermi/core";
import type { MaybePromiseFunction } from "@vermi/utils";
import type { WsContext } from "../interfaces";
import type { EventMatch } from "../services";

@Interceptor()
export class ArgsPipingInterceptor implements InterceptorMethods<WsContext> {
	async intercept(context: WsContext, next: MaybePromiseFunction) {
		let value = context.store.event.data;
		const { args } = context.resolve<EventMatch>("matchData");

		if (!args?.length) {
			return next(context);
		}

		const values: any[] = [];

		for (const arg of args) {
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
