import type { RequestContext } from "@vermi/core";
import type { Dictionary } from "@vermi/utils";

export enum WsEvents {
	Handshake = "ws-hook:handshake",
}

export type WsEventMap = {
	[WsEvents.Handshake]: (
		context: RequestContext,
		data: Dictionary<any>,
	) => Promise<void>;
};
