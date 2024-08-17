import type { ExposedContext, _AppContext } from "@vermi/core";
import type { Dictionary } from "@vermi/utils";
import type { WsMessage } from "../events";
import type { EnhancedWebSocket } from "../utils";

export interface _WsContext<EventMap extends Dictionary = {}>
	extends _AppContext {
	ws: EnhancedWebSocket<EventMap>;
	event: WsMessage<any, EventMap>;
	params: Dictionary;
}

export type WsContext<EventMap extends Dictionary = {}> = ExposedContext<
	_WsContext<EventMap>
>;
