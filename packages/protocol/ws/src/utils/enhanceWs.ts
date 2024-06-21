import type { Dictionary } from "@vermi/utils";
import type { Server, ServerWebSocket } from "bun";
import { type OutgoingEventType, OutgoingMessage } from "../events";
import type { WsData } from "../interfaces";
import type { EventExtraType } from "../interfaces/Message";
import type { Parser } from "../parser/Parser";

export interface EnhancedWebSocket<EventMap extends Dictionary = {}>
	extends ServerWebSocket<WsData> {
	sendEvent<Data>(
		type: EventExtraType<EventMap, OutgoingEventType>,
		data: Data,
	): void;
	sendToChannel<Data>(
		channel: `/${string}`,
		type: EventExtraType<EventMap, OutgoingEventType>,
		data: Data,
	): void;
	broadcast<Data>(
		type: EventExtraType<EventMap, OutgoingEventType>,
		data: Data,
	): void;
}

export const enhanceWs = <EventMap extends Dictionary = {}>(
	_ws: ServerWebSocket<WsData>,
	parser: Parser,
	server: Server,
): EnhancedWebSocket<EventMap> => {
	const ws = _ws as EnhancedWebSocket<EventMap>;

	ws.sendEvent = function sendEvent<Data>(
		type: EventExtraType<EventMap, OutgoingEventType>,
		data?: Data,
	) {
		ws.send(
			parser.encode(
				new OutgoingMessage<Data, EventMap>(ws.data.sid, type, data).toDTO(),
			),
		);
	};

	ws.sendToChannel = function sendToChannel<Data>(
		channel: `/${string}`,
		type: EventExtraType<EventMap, OutgoingEventType>,
		data?: Data,
	) {
		server.publish(
			channel,
			parser.encode(
				new OutgoingMessage<Data, EventMap>(ws.data.sid, type, data).toDTO(),
			),
		);
	};

	ws.broadcast = function broadcast<Data>(
		type: EventExtraType<EventMap, OutgoingEventType>,
		data?: Data,
	) {
		ws.sendToChannel("/", type, data);
	};

	return ws;
};
