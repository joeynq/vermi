import { type Path, getVal } from "@vermi/utils";
import type { AppOptions } from "../interfaces";
import { containerRef } from "../services";

export const Option = (optionKey?: Path<AppOptions>): PropertyDecorator => {
	return (target: any, key: string | symbol) => {
		Object.defineProperty(target, key, {
			get: () => {
				const configuration = containerRef().cradle.appConfig;
				return optionKey
					? getVal(configuration, optionKey as any)
					: configuration;
			},
			configurable: true,
		});
	};
};
