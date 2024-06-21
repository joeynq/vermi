import { Hook } from "@vermi/core";
import type { EnumValues } from "@vermi/utils";
import type { WsEvents } from "../hooks";

export function WsHook(name: EnumValues<typeof WsEvents>) {
	return Hook(name);
}
