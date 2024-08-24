import { Hook, Middleware, Use } from "@vermi/core";
import { validate } from "@vermi/schema";
import type { EventContext } from "../interfaces";

@Middleware()
class EventValidateMiddleware {
	@Hook("events:guard")
	async validate(context: EventContext<any, any>, handlerData: any) {
		const data = context.store.event.payload;
		const args = handlerData.args;

		if (!args?.length) {
			return;
		}

		for (const arg of args) {
			if (arg.required && data === undefined) {
				throw new Error(`Missing required parameter: ${arg.name.toString()}`);
			}

			if (arg.schema && data !== undefined) {
				await validate(arg.schema, data);
			}
		}
	}
}

export const Validate = Use(EventValidateMiddleware);
