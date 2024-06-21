import type { Dictionary } from "@vermi/utils";
import type { EventExtraType, MessageDTO } from "../interfaces/Message";

export abstract class WsMessage<
	Data,
	EventMap extends Dictionary = {},
	Type extends string = string,
> {
	public timestamp = new Date();

	constructor(
		public sid: string,
		public type: EventExtraType<EventMap, Type>,
		public data?: Data,
	) {}

	toDTO(): MessageDTO<Data, EventMap, Type> {
		return {
			sid: this.sid,
			type: this.type,
			timestamp: this.timestamp,
			...(this.data ? { data: this.data } : {}),
		};
	}
}
