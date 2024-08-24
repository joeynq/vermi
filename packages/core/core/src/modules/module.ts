import type { Class } from "@vermi/utils";
import { AppHook, Config, Module } from "../decorators";
import type {
	AppContext,
	ModuleConfig,
	VermiModuleMethods,
	WithHooks,
} from "../interfaces";
import { VermiModule } from "../services";

@Module()
export class CommonModule<
	Config extends WithHooks,
> extends VermiModule<Config> {
	@Config() public config!: Config[];

	@AppHook("app:init")
	async onInit(context: AppContext) {
		for (const config of this.config) {
			await config.hooks?.init?.(context, config);
		}
	}

	@AppHook("app:exit")
	async onExit(context: AppContext) {
		for (const config of this.config) {
			await config.hooks?.destroy?.(context, config);
		}
	}
}

type ConfigFn<T extends VermiModuleMethods<any>> = (
	config: T["config"][number],
) => ModuleConfig<T>;

export const createModule = <T extends VermiModuleMethods<any>>(
	module: Class<T>,
): ConfigFn<T> => {
	return (config) => ({
		module,
		config,
	});
};

export const commonModule = <Config extends WithHooks>(config: Config) => {
	return createModule(CommonModule<Config>)(config);
};
