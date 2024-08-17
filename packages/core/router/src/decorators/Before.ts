import { RouterEvents } from "../events";
import { RouterHook } from "./RouterHook";

export function Before() {
	return RouterHook(RouterEvents.BeforeHandle);
}
