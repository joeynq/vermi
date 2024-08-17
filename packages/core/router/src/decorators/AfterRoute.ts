import { RouterEvents } from "../events";
import { RouterHook } from "./RouterHook";

export function AfterRoute() {
	return RouterHook(RouterEvents.AfterRoute);
}
