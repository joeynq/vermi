import type { MessageDTO } from "../interfaces/Message";

export class WsMessage<Data> {
	public timestamp = new Date();

	constructor(
		public sid: string,
		public type: "connect" | "disconnect" | "message",
		public data?: Data,
	) {}

	toDTO(): MessageDTO<Data> {
		return {
			sid: this.sid,
			timestamp: this.timestamp,
			...(this.data ? { data: this.data } : {}),
		};
	}
}
