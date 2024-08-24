import {
	type AppContext,
	AppHook,
	Config,
	Configuration,
	ContextService,
	Module,
	type RequestContext,
	VermiModule,
	asClass,
} from "@vermi/core";
import { EventEmitter, EventModule } from "@vermi/events";
import {
	type Class,
	type Dictionary,
	pathStartsWith,
	uuid,
} from "@vermi/utils";
import { type Server, type WebSocketHandler } from "bun";
import type {} from "./hooks";
import type { SlashedPath, WsData } from "./interfaces";
import type { Parser } from "./interfaces/Parser";
import { JsonParser } from "./parser/JsonParser";
import { SocketHandler } from "./services";

declare module "@vermi/core" {
	interface AppOptions {
		websocket?: WebSocketHandler<any>;
	}
}

export interface WsModuleOptions {
	namespace: SlashedPath;
	parser?: Class<Parser>;
}

@Module({ deps: [SocketHandler, EventModule] })
export class WsModule extends VermiModule<WsModuleOptions> {
	@Config() public config!: WsModuleOptions[];

	constructor(
		protected configuration: Configuration,
		protected contextService: ContextService,
		protected socketHandler: SocketHandler,
	) {
		super();
	}

	@AppHook("app:init")
	async onInit(context: AppContext) {
		context.register("ws:emitter", asClass(EventEmitter).singleton());
		for (const { namespace, parser = JsonParser } of this.config) {
			context.register(`ws:parser:${namespace}`, asClass(parser).singleton());
		}

		this.socketHandler.buildHandler();
	}

	@AppHook("app:started")
	async onStarted(_: AppContext, server: Server) {
		this.socketHandler.setServer(server);
	}

	@AppHook("app:request")
	async onRequest(context: RequestContext, server: Server) {
		const { request } = context.store;

		const config = this.config.find((c) =>
			pathStartsWith(request.url, c.namespace),
		);

		if (!config) {
			return;
		}

		const { hooks, logger } = context.store;

		logger.info(`[WS] Handshake request: ${request.url}`);

		const customData: Dictionary<any> = {};

		await hooks.invoke("ws-hook:handshake", [context, customData]);

		server.upgrade<WsData>(request, {
			data: {
				...customData,
				sid: uuid(),
				namespace: config.namespace,
			},
		});
		return {};
	}
}
