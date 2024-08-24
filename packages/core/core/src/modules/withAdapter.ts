import { extendedCamelCase } from "@vermi/utils";
import { asClass, asValue } from "awilix";
import type {
	AdapterMethods,
	AppContext,
	WithAdapter,
	WithHooks,
} from "../interfaces";
import { commonModule } from "./module";

export interface AdapterConfig<Adapter extends AdapterMethods<any>>
	extends WithHooks,
		WithAdapter<Adapter> {}

export const getProvider = <Provider>(
	provider: string | symbol | Provider | ((context: any) => Provider),
	context: AppContext,
) => {
	switch (typeof provider) {
		case "string":
		case "symbol":
			return context.resolve<Provider>(provider);
		case "function":
			return (provider as any)(context);
		default:
			return provider;
	}
};

export const registerAdapter = async <
	Context extends AppContext,
	Config extends WithAdapter<any>,
>(
	context: Context,
	config: Config,
	callback?: (
		instance: InstanceType<Config["adapter"]["class"]>,
	) => Promise<void>,
): Promise<InstanceType<Config["adapter"]["class"]>> => {
	const logger = context.store.logger;

	const adapter = config.adapter;

	const resolver = asClass(adapter.class, {
		dispose: adapter.onDestroy,
	});
	const instance = context.build<any>(resolver);

	const adapterName = extendedCamelCase(`adapter:${adapter.name}`);

	instance.provider = getProvider(adapter.provider, context);

	await callback?.(instance);

	context.register(adapterName, asValue(instance));
	await adapter.onInit?.(instance);

	return instance;
};

export const withAdapter = <
	Config extends AdapterConfig<Adapter>,
	Adapter extends AdapterMethods<any>,
>(
	config: Config,
) => {
	return commonModule({
		...config,
		hooks: {
			init: async (context, conf) => {
				await registerAdapter(context, conf);
			},
		},
	} as Config & WithAdapter<Adapter>);
};
