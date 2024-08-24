import type { ExposedContext, _AppContext } from "@vermi/core";
import type { ConsumerAdapter } from "./ConsumerAdapter";

export interface EventType<Payload> {
	traceId: string;
	group: string;
	payload: Payload;
	timestamp: number;
}

export interface _EventContext<Payload, Client> extends _AppContext {
	event: EventType<Payload>;
	consumer: ConsumerAdapter<Client>;
	group: string;
	[key: string]: any;
}

export type EventContext<Payload, Client> = ExposedContext<
	_EventContext<Payload, Client>
>;
