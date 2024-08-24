import type { Server, ServerWebSocket } from "bun";
import type { WsData } from "../interfaces";
import type { Parser } from "../interfaces/Parser";

export interface EnhancedWebSocket extends ServerWebSocket<WsData> {
	sendEvent<Data>(data: Data): void;
	sendToNamespace<Data>(channel: `/${string}`, data: Data): void;
	broadcast<Data>(data: Data): void;
	parser: Parser;
}

export const enhanceWs = (
	_ws: ServerWebSocket<WsData>,
	parser: Parser,
	server: Server,
): EnhancedWebSocket => {
	const ws = _ws as EnhancedWebSocket;

	ws.parser = parser;

	ws.sendEvent = function sendEvent<Data>(data?: Data) {
		ws.send(parser.encode(data));
	};

	ws.sendToNamespace = function sendToChannel<Data>(
		namespace: `/${string}`,
		data?: Data,
	) {
		server.publish(namespace, parser.encode(data));
	};

	return ws;
};
