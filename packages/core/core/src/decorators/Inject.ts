import type { InjectionToken } from "../interfaces";
import { containerRef } from "../services";
import { getTokenName } from "../utils";

export const Inject = <T>(token?: InjectionToken<T>) => {
	return (target: any, propertyKey: string | symbol) => {
		Object.defineProperty(target, propertyKey, {
			get() {
				const name = token ? getTokenName(token) : propertyKey.toString();
				const has = containerRef().hasRegistration(name);
				if (!has) {
					return undefined;
				}
				return containerRef().resolve(name);
			},
			configurable: true,
		});
	};
};
