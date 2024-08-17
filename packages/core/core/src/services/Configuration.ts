import { type Class, deepMerge, isClass } from "@vermi/utils";
import { Injectable } from "../decorators";
import type { AppOptions, ModuleConfig } from "../interfaces";
import type { VermiModule } from "./VermiModule";

@Injectable()
export class Configuration {
	options!: AppOptions;

	get bunOptions() {
		const { modules, env, log, ...options } = this.options;
		return options;
	}

	constructor(appConfig?: AppOptions) {
		this.options = {
			modules: new Map(),
			...appConfig,
		};
	}

	getModuleConfig<Config>(
		module: string | Class<VermiModule<Config>>,
	): ModuleConfig<Config> | undefined {
		const moduleName = typeof module === "string" ? module : module.name;
		return this.options.modules.get(moduleName);
	}

	setModuleConfig<Config>(
		module: Class<VermiModule<Config>> | string,
		config: Config,
	): void;
	setModuleConfig<Config>(config: ModuleConfig<Config>): void;
	setModuleConfig<Config>(
		module: Class<VermiModule<Config>> | string | ModuleConfig<Config>,
		config?: Config,
	): void {
		const moduleName =
			typeof module === "string"
				? module
				: isClass(module)
					? module.name
					: module.module.name;
		const existing =
			this.options.modules.get(moduleName) || ({} as ModuleConfig<Config>);

		if (isClass(module)) {
			this.options.modules.set(
				module.name,
				deepMerge(existing, { config } as any),
			);
			return;
		}

		if (typeof module === "string") {
			if (!existing?.module) {
				throw new Error(`Module ${module} is not configured.`);
			}
			this.options.modules.set(module, deepMerge(existing, { config } as any));
			return;
		}

		this.options.modules.set(module.module.name, deepMerge(existing, module));
	}
}
