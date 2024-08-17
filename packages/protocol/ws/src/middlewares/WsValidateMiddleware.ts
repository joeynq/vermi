import { Middleware, Use } from "@vermi/core";
import { validate } from "@vermi/schema";
import { WsHook } from "../decorators";
import { InvalidData } from "../exceptions";
import type { WsContext } from "../interfaces";
import type { EventMatch } from "../services";

@Middleware()
class WsValidateMiddleware {
	@WsHook("ws-hook:guard")
	async validate(context: WsContext, handlerData: EventMatch) {
		const data = context.store.event.data;
		const ws = context.store.ws;
		const args = handlerData.args;

		if (!args?.length) {
			return;
		}

		for (const arg of args) {
			if (arg.required && data === undefined) {
				throw new InvalidData(
					ws.data.sid,
					`Missing required parameter: ${arg.name.toString()}`,
				);
			}

			if (arg.schema && data !== undefined) {
				await validate(arg.schema, data);
			}
		}
	}
}

export const Validate = Use(WsValidateMiddleware);
