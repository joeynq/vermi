import { containerRef } from "../services";

export const Config = (moduleName?: string): PropertyDecorator => {
	return (target: any, key: string | symbol) => {
		Object.defineProperty(target, key, {
			get: () => {
				const name = moduleName || target.constructor.name;
				const configuration = containerRef().resolve("configuration");
				return configuration.getModuleConfig(name) || [];
			},
			configurable: true,
		});
	};
};
