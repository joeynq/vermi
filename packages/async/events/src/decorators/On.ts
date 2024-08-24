import { Intercept, useDecorators } from "@vermi/core";
import { ArgsPipingInterceptor } from "../interceptors";
import { type EventFilter, eventStore } from "../stores";

export function On<Payload>(filter: string | EventFilter<Payload>) {
	return useDecorators((target: any, key: string | symbol) => {
		eventStore.apply(target.constructor).addHandler(filter, key);
	}, Intercept(ArgsPipingInterceptor));
}
