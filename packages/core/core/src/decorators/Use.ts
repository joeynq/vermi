import type { Class } from "@vermi/utils";
import { dependentStore, hookStore } from "../store";
import { useDecorators } from "../utils";

export const Use = <Middleware extends Class<any>>(
	middleware: Middleware,
): MethodDecorator => {
	return useDecorators(
		(target: any) => {
			dependentStore.apply(target.constructor).addDependents(middleware);
		},
		(target: any, propertyKey: string | symbol) => {
			const middlewareHook = hookStore.apply(middleware).get();
			const store = hookStore.apply(target.constructor);

			for (const [event, handlers] of middlewareHook.entries()) {
				for (const handler of handlers) {
					handler.scope = `${target.constructor.name}.${String(propertyKey)}`;
					store.addHandler(event, handler);
				}
			}
		},
	);
};
