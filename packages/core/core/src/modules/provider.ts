import {
	type Class,
	type MaybePromise,
	extendedCamelCase,
	isClass,
} from "@vermi/utils";
import {
	type BuildResolver,
	type LifetimeType,
	asFunction,
	asValue,
} from "awilix";
import type { WithHooks } from "../interfaces";
import { commonModule } from "./module";

export interface RegisterOptions<Provider> {
	provider: Class<Provider> | Provider;
	onResolve?: (instance: Provider) => MaybePromise<void>;
	onDispose?: (instance: Provider) => MaybePromise<void>;
	lifetime?: LifetimeType;
	params?: ConstructorParameters<Class<Provider>>;
}

export type ProviderOptions<Provider> =
	| Provider
	| RegisterOptions<Provider>
	| BuildResolver<Provider>["resolve"]
	| BuildResolver<Provider>;

const isRegisterOptions = <Provider>(
	options: ProviderOptions<Provider>,
): options is RegisterOptions<Provider> => {
	return (options as RegisterOptions<Provider>).provider !== undefined;
};

const isResolver = <Provider>(
	resolve: ProviderOptions<Provider>,
): resolve is BuildResolver<Provider>["resolve"] => {
	return typeof resolve === "function";
};

const isBuildResolver = <Provider>(
	resolver: ProviderOptions<Provider>,
): resolver is BuildResolver<Provider> => {
	return resolver && typeof resolver === "object" && "resolve" in resolver;
};

export interface ProviderModuleConfig<Provider> extends WithHooks {
	options: ProviderOptions<Provider>;
}

export const provider = <Provider>(
	name: string,
	options: ProviderOptions<Provider>,
	override?: ProviderModuleConfig<Provider>["hooks"],
) => {
	return commonModule<ProviderModuleConfig<Provider>>({
		options,
		hooks: {
			init: async (context, config) => {
				if (override?.init) {
					return override.init(context, config);
				}

				const logger = context.store.logger;

				const registeredName = extendedCamelCase(name);

				if (isClass(options)) {
					context.register(registeredName, asValue(new options()));
				} else if (isRegisterOptions(options)) {
					const {
						provider,
						params = [],
						onResolve,
						onDispose,
						lifetime = "SINGLETON",
					} = options;
					const instance = isClass(provider)
						? new provider(...params)
						: provider;
					await onResolve?.(instance);
					context.register(
						registeredName,
						asFunction(() => instance, {
							lifetime,
							dispose: () => onDispose?.(instance),
						}),
					);
				} else if (isResolver(options)) {
					context.register(registeredName, {
						resolve: options,
						lifetime: "SINGLETON",
					});
				} else if (isBuildResolver(options)) {
					context.register(registeredName, options);
				} else {
					context.register(registeredName, asValue(options));
				}

				if (logger) {
					logger.info(`Registering provider: ${registeredName}`);
				}
			},
			destroy: async (context, config) => {
				if (override?.destroy) {
					return override.destroy(context, config);
				}
			},
		},
	});
};
