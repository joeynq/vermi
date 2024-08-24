import {
	Configuration,
	type ContextService,
	type EnhancedContainer,
	Hooks,
	Injectable,
	Logger,
	type LoggerAdapter,
} from "@vermi/core";
import { type EventEmitter } from "@vermi/events";
import { ensure } from "@vermi/utils";
import type { Server, ServerWebSocket } from "bun";
import { WsEvents } from "../hooks";
import type { Parser, WsData } from "../interfaces";
import { WsMessage } from "../models";
import { type EnhancedWebSocket, enhanceWs } from "../utils";

@Injectable("SINGLETON")
export class SocketHandler {
	#sockets = new Map<string, EnhancedWebSocket>();
	#server!: Server;

	@Logger() private logger!: LoggerAdapter;

	get context() {
		ensure(this.contextService.context, "Context not found");
		return this.contextService.context as EnhancedContainer<any>;
	}

	get emitter() {
		return this.context.resolve<EventEmitter>("ws:emitter");
	}

	constructor(
		protected configuration: Configuration,
		protected contextService: ContextService,
		protected hooks: Hooks<typeof WsEvents, any>,
	) {}

	#broadcast<Data>(data: Data) {
		for (const ws of this.#sockets.values()) {
			this.#emit(ws, "message", data);
		}
	}

	#emit<Data>(
		ws: EnhancedWebSocket,
		type: (typeof WsMessage)["prototype"]["type"],
		data?: Data,
	) {
		const { sid, namespace } = ws.data;
		const payload = new WsMessage(sid, type, data);

		this.emitter.emit(namespace, { ws, payload });
	}

	async #onOpen(ws: ServerWebSocket<WsData>) {
		const parser = this.context.resolve<Parser>(
			`ws:parser:${ws.data.namespace}`,
		);
		const enhancedWs = enhanceWs(ws, parser, this.#server);
		enhancedWs.broadcast = this.#broadcast.bind(this);

		this.#sockets.set(ws.data.sid, enhancedWs);

		ws.subscribe(ws.data.namespace);

		this.logger.info(`Client connected with sid: ${ws.data.sid}`);

		this.#emit(enhancedWs, "connect");
	}

	async #onMessage(_ws: ServerWebSocket<WsData>, message: Buffer) {
		const ws = this.#sockets.get(_ws.data.sid);
		ensure(ws, "Socket not found");

		this.logger.info(`Received message from sid: ${ws.data.sid}.`);

		this.#emit(ws, "message", ws.parser.decode(message));
	}
	async #onClose(_ws: ServerWebSocket<WsData>, code: number, reason?: string) {
		const ws = this.#sockets.get(_ws.data.sid);
		ensure(ws, "Socket not found");

		ws.unsubscribe("/");

		this.logger.info("Client disconnected with sid: {sid}", {
			sid: ws.data.sid,
		});

		this.#emit(ws, "disconnect", { code, reason });

		this.#sockets.delete(ws.data.sid);
	}

	buildHandler(): void {
		this.configuration.options.websocket = {
			...this.configuration.options.websocket,
			open: this.#onOpen.bind(this),
			message: this.#onMessage.bind(this),
			close: this.#onClose.bind(this),
		};
	}

	setServer(server: Server) {
		this.#server = server;
	}
}
