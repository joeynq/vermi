import { type EventFilter, eventStore } from "../stores";

export function On(filter: string | EventFilter) {
	return (target: any, key: string | symbol) => {
		eventStore.apply(target.constructor).addHandler(filter, key);
	};
}
