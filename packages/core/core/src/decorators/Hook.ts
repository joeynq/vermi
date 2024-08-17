import type { EnumValues } from "@vermi/utils";
import { hookStore } from "../store";

export function Hook<EventType extends { [key: string]: string }>(
	event: EnumValues<EventType>,
) {
	return (target: any, methodName: string | symbol) => {
		hookStore.apply(target.constructor).addHandler(event, {
			handler: target[methodName],
			target: target.constructor,
		});
	};
}
