import { createModule } from "@vermi/core";
import { events } from "@vermi/events";
import type { Class } from "@vermi/utils";
import { WsModule, type WsModuleOptions } from "./WsModule";
import { WsConsumer } from "./adapters/WsConsumer";
import type { WsMessage } from "./models";

export const ws = (config: WsModuleOptions, handlers: Class<any>[]) => {
	return [
		createModule(WsModule)(config),
		events(handlers, {
			adapter: {
				class: WsConsumer,
				name: "ws",
				provider: "ws:emitter",
			},
			group: config.namespace,
			traceId(payload) {
				const ctx = payload as WsMessage<any>;
				return ctx.sid;
			},
		}),
	];
};
