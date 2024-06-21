import type { Class } from "@vermi/utils";
import type { Configuration } from "./Configuration";

export interface VermiModuleMethods<Options> {
	config: Options;

	use<O, M extends VermiModule<O>>(module: [Class<M>, M["config"]]): void;
	use<O, M extends VermiModule<O>>(
		module: Class<M>,
		options: M["config"],
	): void;
}

export abstract class VermiModule<Options>
	implements VermiModuleMethods<Options>
{
	readonly config!: Options;
	protected configuration!: Configuration;

	use<O, M extends VermiModule<O>>(
		module: Class<M> | [Class<M>, M["config"]],
		options?: M["config"],
	) {
		const [mod, config] = Array.isArray(module) ? module : [module, options];
		this.configuration.setModuleConfig(mod, config);
	}
}
