import { RouterEvents } from "../events";
import { RouterHook } from "./RouterHook";

export function After() {
	return RouterHook(RouterEvents.AfterHandle);
}
