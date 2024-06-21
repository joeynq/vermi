import type { EnhancedContainer, _AppContext } from "@vermi/core";
import type { ConsumerAdapter } from "./ConsumerAdapter";

export interface EventType<Payload> {
	traceId: string;
	group: string;
	payload: Payload;
	timestamp: number;
}

export interface _EventContext<Payload, Client> extends _AppContext {
	payload: EventType<Payload>;
	consumer: ConsumerAdapter<Client>;
	group: string;
}

export type EventContext<Payload, Client> = EnhancedContainer<
	_EventContext<Payload, Client>
>;
