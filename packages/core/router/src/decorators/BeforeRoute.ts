import { RouterEvents } from "../events";
import { RouterHook } from "./RouterHook";

export function BeforeRoute() {
	return RouterHook(RouterEvents.BeforeRoute);
}
