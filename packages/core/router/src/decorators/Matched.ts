import { RouterEvents } from "../events";
import { RouterHook } from "./RouterHook";

export function Matched() {
	return RouterHook(RouterEvents.Match);
}
