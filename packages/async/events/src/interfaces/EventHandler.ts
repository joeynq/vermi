import type { MaybePromise } from "@vermi/utils";
import type { EventType } from "./EventContext";

export interface ContextWithPayload<Payload> {
	payload: Payload;
	[key: string]: any;
}

export interface EventHandler {
	<Payload>(
		context: ContextWithPayload<EventType<Payload>>,
	): MaybePromise<void>;
	name: string;
}
