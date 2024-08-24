import { useDecorators } from "@vermi/core";
import { On as BaseOn } from "@vermi/events";
import type { WsMessage } from "../models";

export const On = <Data>(
	typeOrEvent:
		| "connect"
		| "disconnect"
		| "message"
		| ((payload?: Data) => boolean),
) => {
	return useDecorators(
		BaseOn<WsMessage<Data>>(
			typeof typeOrEvent === "function"
				? (message) => message.type === "message" && typeOrEvent(message.data)
				: (message) => message.type === typeOrEvent,
		),
	);
};
