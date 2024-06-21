import { Hook } from "@vermi/core";
import type { RouterEvents } from "../events";

export function RouterHook(event: RouterEvents) {
	return Hook(event);
}
