import type { TSchema } from "@sinclair/typebox";
import {
	Configuration,
	type ContextService,
	type EnhancedContainer,
	Hooks,
	Injectable,
	Logger,
	type LoggerAdapter,
	asValue,
} from "@vermi/core";
import {
	type Class,
	type MaybePromiseFunction,
	createRouter,
	ensure,
	tryRun,
} from "@vermi/utils";
import type { Server, ServerWebSocket } from "bun";
import { IncomingMessage, type IncomingMessageDTO } from "../events";
import {
	InternalError,
	InvalidData,
	WsCloseCode,
	WsException,
} from "../exceptions";
import { type WsEventMap, WsEvents } from "../hooks";
import type { WsData, _WsContext } from "../interfaces";
import { type EnhancedWebSocket, enhanceWs } from "../utils";

export interface EventMatch {
	handler: MaybePromiseFunction;
	channel: `/${string}`;
	handlerId: string;
	args: {
		name: string | symbol;
		required?: boolean;
		parameterIndex: number;
		schema: TSchema;
		pipes?: Class<any>[];
	}[];
}

@Injectable("SINGLETON")
export class SocketHandler {
	#sockets = new Map<string, EnhancedWebSocket<WsData>>();
	#server!: Server;

	protected router = createRouter<EventMatch>();

	@Logger() private logger!: LoggerAdapter;

	get context() {
		ensure(this.contextService.context, "Context not found");
		return this.contextService.context as EnhancedContainer<_WsContext>;
	}

	constructor(
		protected configuration: Configuration,
		protected contextService: ContextService,
		protected hooks: Hooks<typeof WsEvents, WsEventMap>,
	) {}

	#prepareContext(_ws: ServerWebSocket<WsData>) {
		const ws = enhanceWs(_ws, this.context.cradle.parser, this.#server);
		const context = this.context.createEnhancedScope();

		context.register({
			traceId: asValue(ws.data.sid),
			ws: asValue(ws),
		});
		return context;
	}

	#errorHandler(ws: EnhancedWebSocket<WsData>, error: Error) {
		this.logger.error(error, "Error handling message");
		if (error instanceof WsException) {
			return ws.sendEvent("error", error);
		}
		const errorEvent = new InternalError(ws.data.sid, error.message, error);
		return ws.sendEvent("error", errorEvent);
	}

	async #onOpen(ws: ServerWebSocket<WsData>) {
		return this.contextService.runInContext(
			this.#prepareContext(ws),
			async (context: EnhancedContainer<_WsContext>) => {
				const { ws } = context.cradle;
				const [error] = await tryRun(async () => {
					if (!ws.data.sid) {
						this.logger.error("No sid provided");
						return ws.close(WsCloseCode.InvalidData, "No sid provided");
					}

					this.hooks.invoke("ws-hook:open", [context.expose()]);

					ws.subscribe("/");

					this.#sockets.set(ws.data.sid, ws);

					ws.sendEvent("connect", { sid: ws.data.sid });
					this.logger.info("Client connected with sid: {sid}", {
						sid: ws.data.sid,
					});
				});

				error && this.#errorHandler(ws, error);
			},
		);
	}

	async #onMessage(ws: ServerWebSocket<WsData>, message: Buffer) {
		return this.contextService.runInContext(
			this.#prepareContext(ws),
			async (context: EnhancedContainer<_WsContext>) => {
				const { ws, parser } = context.cradle;
				const [error] = await tryRun(async () => {
					const { channel, sid, type, data } =
						parser.decode<IncomingMessageDTO<any>>(message);

					const event = new IncomingMessage(sid, type, channel, data);

					context.register("event", asValue(event));

					await this.hooks.invoke(WsEvents.InitEvent, [context.expose()]);

					if (!(event instanceof IncomingMessage)) {
						throw new InvalidData(ws.data.sid, "Invalid message type");
					}

					const result = this.router.lookup(
						`/${event.type}${ws.data.path}${event.channel}`,
					);

					if (!result) {
						throw new InvalidData(ws.data.sid, "Event is not handled");
					}

					const { handler, handlerId } = result;

					context.register({
						params: asValue(result.params || {}),
						matchData: asValue(result),
					});

					await this.hooks.invoke(WsEvents.Guard, [context.expose(), result], {
						when: (scope: string) => scope === handlerId,
					});

					await handler(context.expose());
				});

				error && this.#errorHandler(ws, error);
			},
		);
	}
	async #onClose(ws: ServerWebSocket<WsData>, code: number, reason?: string) {
		return this.contextService.runInContext(
			this.#prepareContext(ws),
			async (context: EnhancedContainer<_WsContext>) => {
				const { ws } = context.cradle;

				const [error] = await tryRun(async () => {
					this.hooks.invoke("ws-hook:close", [context.expose(), code, reason]);

					ws.unsubscribe("/");
					this.#sockets.delete(ws.data.sid);
				});

				error && this.#errorHandler(ws, error);
			},
		);
	}

	addEvent(event: string, handler: EventMatch) {
		const current = this.router.lookup(event);
		if (!current) {
			this.router.insert(event, handler);
		}
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
