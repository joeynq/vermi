import type { Dictionary } from "@vermi/utils";
import type { MessageDTO } from "../interfaces/Message";
import { WsMessage } from "./WsMessage";

export type OutgoingEventType =
	| "error"
	| "connect"
	| "subscribed"
	| "unsubscribed";

export interface OutgoingMessageDTO<Data, EventMap extends Dictionary = {}>
	extends MessageDTO<Data, EventMap, OutgoingEventType> {}

export class OutgoingMessage<
	Data,
	EventMap extends Dictionary = {},
> extends WsMessage<Data, EventMap, OutgoingEventType> {}
