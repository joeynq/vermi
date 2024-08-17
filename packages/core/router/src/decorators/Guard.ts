import { RouterEvents } from "../events";
import { RouterHook } from "./RouterHook";

export function Guard() {
	return RouterHook(RouterEvents.Guard);
}
