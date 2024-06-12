import {
	Config,
	Configuration,
	type ContextService,
	type EnhancedContainer,
	Hooks,
	Injectable,
	Logger,
	type LoggerAdapter,
	asClass,
	asValue,
} from "@vermi/core";
import { FindMyWay } from "@vermi/find-my-way";
import { type Class, ensure, tryRun } from "@vermi/utils";
import type { Server, ServerWebSocket } from "bun";
import type { WsModuleOptions } from "../WsModule";
import { type EventType, WsEvent, WsMessage } from "../events";
import { WsCloseCode } from "../exceptions";
import type { WsEventMap, WsEvents } from "../hooks";
import type { WsData, _WsContext } from "../interfaces";
import type { Parser } from "../parser/Parser";
import { type WsHandler, wsHandlerStore } from "../stores";
import { type EnhancedWebSocket, enhanceWs } from "../utils";

@Injectable("SINGLETON")
export class SocketHandler {
	#sockets = new Map<string, EnhancedWebSocket<WsData>>();
	#server!: Server;

	protected router = new FindMyWay<WsHandler>();

	@Logger() private logger!: LoggerAdapter;
	@Config("WsModule") private config!: WsModuleOptions;

	get context() {
		ensure(this.contextService.context, "Context not found");
		return this.contextService.context as EnhancedContainer<_WsContext>;
	}

	constructor(
		protected configuration: Configuration,
		protected contextService: ContextService,
		protected hooks: Hooks<typeof WsEvents, WsEventMap>,
	) {}

	#createEvent(parser: Parser, message: Buffer) {
		const { sid, type, data, topic, event } = parser.decode<any>(message);

		if (type === "subscribe" || type === "unsubscribe") {
			return new WsEvent(sid, type, topic);
		}

		if (topic && (!type || type === "data")) {
			return new WsMessage(sid, event, topic, data);
		}

		return new WsEvent(sid, type, data);
	}

	#prepareContext(_ws: ServerWebSocket<WsData>) {
		const ws = enhanceWs(_ws, this.context.cradle.parser);
		const context = this.context.createEnhancedScope();
		const sendTopic = (topic: `/${string}`, type: EventType, data: any) => {
			this.#server.publish(
				topic,
				context.cradle.parser.encode(new WsEvent(ws.data.sid, type, data)),
			);
		};

		const broadcast = (type: EventType, data: any) => {
			sendTopic("/", type, data);
		};

		context.register({
			traceId: asValue(ws.data.sid),
			ws: asValue(ws),
			broadcast: asValue(broadcast),
			sendTopic: asValue(sendTopic),
		});
		return context;
	}

	async #onOpen(_ws: ServerWebSocket<WsData>) {
		const ws = enhanceWs(_ws, this.context.cradle.parser);
		const [error] = await tryRun(async () => {
			if (!ws.data.sid) {
				this.logger.error("No sid provided");
				return ws.close(WsCloseCode.InvalidData, "No sid provided");
			}

			ws.subscribe("/");

			this.#sockets.set(ws.data.sid, ws);

			ws.sendEvent("connect");
			this.logger.info("Client connected with sid: {sid}", {
				sid: ws.data.sid,
			});
		});

		if (error) {
			this.logger.error(error, "Error handling open");
			return ws.sendEvent("error", error);
		}
	}

	async #onMessage(ws: ServerWebSocket<WsData>, message: Buffer) {
		return this.contextService.runInContext(
			this.#prepareContext(ws),
			async (context: EnhancedContainer<_WsContext>) => {
				const { ws, parser } = context.cradle;
				const [error] = await tryRun(async () => {
					const event = this.#createEvent(parser, message);
					context.register("event", asValue(event));

					await this.hooks.invoke("ws-hook:initEvent", [context.expose()]);

					if (event.type === "subscribe") {
						this.logger.info("Subscribing to {topic}", { topic: event.data });
						ws.subscribe(event.data);
						return;
					}

					if (event.type === "unsubscribe") {
						this.logger.info("Unsubscribing from {topic}", {
							topic: event.data,
						});
						ws.unsubscribe(event.data);
						return;
					}

					if (!(event instanceof WsMessage)) {
						throw new Error("Invalid message type");
					}

					const result = this.router.find(
						"NOTIFY",
						`${event.event}${event.topic}`,
					);

					if (!result) {
						throw new Error("Event is not handled");
					}

					const { eventStore, method, handlerId } = result.store;

					context.register("params", asValue(result.params));

					await this.hooks.invoke(
						"ws-hook:guard",
						[context.expose(), result.store],
						{ when: (scope: string) => scope === handlerId },
					);

					const instance = context.build(asClass(eventStore));
					const methodHandler = instance[method].bind(instance);

					await methodHandler(context.expose());
				});

				if (error) {
					this.logger.error(error, "Error handling message");
					return ws.sendEvent("error", error);
				}
			},
		);
	}
	async #onClose(_ws: ServerWebSocket<WsData>, code: number, reason: string) {
		const ws = enhanceWs(_ws, this.context.cradle.parser);
		ws.unsubscribe("/");
		this.#sockets.delete(ws.data.sid);
	}

	initRouter(eventStores: Class<any>[]) {
		for (const eventStore of eventStores) {
			const store = wsHandlerStore.apply(eventStore).get();

			for (const [event, handlerData] of store.entries()) {
				this.router.add("NOTIFY", `${event}${handlerData.topic}`, handlerData);
			}
		}
	}

	buildHandler(): void {
		this.configuration.options.websocket = {
			open: this.#onOpen.bind(this),
			message: this.#onMessage.bind(this),
			close: this.#onClose.bind(this),
			...this.config.server,
		};
	}

	setServer(server: Server) {
		this.#server = server;
	}
}
