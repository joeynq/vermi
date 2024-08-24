import { type Class, extendedCamelCase } from "@vermi/utils";
import { asValue } from "awilix";
import type { AppContext } from "../interfaces";
import { type Hooks, containerRef } from "../services";
import { hookStore } from "../store";

export const registerHooks = (
	context: AppContext,
	...providers: Class<any>[]
) => {
	const hooks = context.resolve<Hooks>("hooks");

	for (const provider of Object.values(providers)) {
		const serviceHooks = hookStore.apply(provider).get();
		for (const [event, handlers] of serviceHooks.entries()) {
			for (const { target, handler, scope } of handlers) {
				const useTarget = target?.name && target.name !== provider.name;
				const instance = containerRef().resolve<any>(
					extendedCamelCase(useTarget ? target.name : provider.name),
				);
				hooks.register(event, {
					target: useTarget ? target : undefined,
					handler: handler.bind(instance),
					scope,
				});
			}
		}
	}

	context.register("hooks", asValue(hooks));
};
