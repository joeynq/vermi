import type { Class, Editable } from "@vermi/utils";
import { type LifetimeType, RESOLVER, type asClass } from "awilix";

export type InjectionOptions<T> = Editable<ReturnType<typeof asClass<T>>>;

export function Injectable(): ClassDecorator;
export function Injectable(lifetime: LifetimeType): ClassDecorator;
export function Injectable<T>(options: InjectionOptions<T>): ClassDecorator;
export function Injectable<T extends Class<T>>(
	lifetimeOrOptions: LifetimeType | InjectionOptions<T> = "SINGLETON",
) {
	return (target: T) => {
		if (typeof lifetimeOrOptions === "string") {
			Object.defineProperty(target, RESOLVER, {
				value: {
					lifetime: lifetimeOrOptions,
				},
			});

			return;
		}
		Object.defineProperty(target, RESOLVER, {
			value: lifetimeOrOptions,
		});
	};
}
