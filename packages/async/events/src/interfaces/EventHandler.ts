import type { MaybePromise } from "@vermi/utils";

export interface EventHandler {
	<Payload>(payload: Payload): MaybePromise<void>;
	name: string;
}
