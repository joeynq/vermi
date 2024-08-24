import { Inject } from "@vermi/core";
import { EventEmitterKey } from "../consts";

export function Emitter() {
	return Inject(EventEmitterKey);
}
