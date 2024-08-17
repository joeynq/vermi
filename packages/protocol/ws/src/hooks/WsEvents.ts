import type { RequestContext } from "@vermi/core";
import type { Dictionary } from "@vermi/utils";
import type { WsContext } from "../interfaces";
import type { EventMatch } from "../services";

export enum WsEvents {
	InitEvent = "ws-hook:initEvent",
	AfterEvent = "ws-hook:afterEvent",
	Handshake = "ws-hook:handshake",
	Subscribe = "ws-hook:subscribe",
	Unsubscribe = "ws-hook:unsubscribe",
	Guard = "ws-hook:guard",
	Close = "ws-hook:close",
	Open = "ws-hook:open",
}

export type WsEventMap = {
	[WsEvents.Handshake]: (
		context: RequestContext,
		data: Dictionary<any>,
	) => Promise<void>;

	[WsEvents.Subscribe]: (context: WsContext, channel: string) => Promise<void>;

	[WsEvents.Unsubscribe]: (
		context: WsContext,
		channel: string,
	) => Promise<void>;

	[WsEvents.Guard]: (
		context: WsContext,
		handlerData: EventMatch,
	) => Promise<void>;

	[WsEvents.InitEvent]: (context: WsContext) => Promise<void>;

	[WsEvents.AfterEvent]: (
		context: WsContext,
		handlerData: EventMatch,
	) => Promise<void>;

	[WsEvents.Close]: (
		context: WsContext,
		code: number,
		reason?: string,
	) => Promise<void>;

	[WsEvents.Open]: (context: WsContext) => Promise<void>;
};
