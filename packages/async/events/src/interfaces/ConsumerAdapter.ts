import type { AdapterMethods } from "@vermi/core";
import type { EventHandler } from "./EventHandler";

export interface ConsumerAdapter<Client> extends AdapterMethods<Client> {
	type: "consumer";
	subscribe(event: string, handler: EventHandler): void;
}
