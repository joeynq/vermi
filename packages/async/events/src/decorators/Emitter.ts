import { Inject } from "@vermi/core";

export function Emitter() {
	return Inject("events:emitter");
}
