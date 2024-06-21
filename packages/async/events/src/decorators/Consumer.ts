import { Inject } from "@vermi/core";

export function Consumer(name = "default") {
	return Inject(`events:consumer:${name}`);
}
