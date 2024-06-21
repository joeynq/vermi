import type { Dictionary } from "@vermi/utils";
import type { EventExtraType, MessageDTO } from "../interfaces/Message";
import { WsMessage } from "./WsMessage";

export type IncomingEventType = string;

export interface IncomingMessageDTO<Data, EventMap extends Dictionary = {}>
	extends MessageDTO<Data, EventMap, IncomingEventType> {
	channel: `/${string}`;
}

export class IncomingMessage<
	Data,
	EventMap extends Dictionary = {},
> extends WsMessage<Data, EventMap, IncomingEventType> {
	constructor(
		sid: string,
		type: EventExtraType<EventMap, IncomingEventType>,
		public channel: `/${string}`,
		data?: Data,
	) {
		super(sid, type, data);
	}

	toDTO(): IncomingMessageDTO<Data, EventMap> {
		return {
			...super.toDTO(),
			channel: this.channel,
		};
	}
}
