import {
	type ProviderModuleConfig,
	type ProviderOptions,
	provider,
} from "../modules";
import { UseModule } from "./UseModule";

export function UseProvider<Provider>(
	name: string,
	options: ProviderOptions<Provider>,
	override?: ProviderModuleConfig<Provider>["hooks"],
): ClassDecorator {
	const { module, config } = provider(name, options, override);
	return UseModule(module, config);
}
