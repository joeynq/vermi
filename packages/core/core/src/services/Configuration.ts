import { type Class, isClass } from "@vermi/utils";
import { Injectable } from "../decorators";
import type {
	AppOptions,
	ModuleConfig,
	VermiModuleMethods,
} from "../interfaces";

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

	getModuleConfig<Config, Module extends VermiModuleMethods<Config>>(
		module: string | Class<Module>,
	): ModuleConfig<VermiModuleMethods<Config>>[];
	getModuleConfig<Config, Module extends VermiModuleMethods<Config>>(
		module: string | Class<Module>,
		id: string,
	): ModuleConfig<VermiModuleMethods<Config>> | undefined;
	getModuleConfig<Config, Module extends VermiModuleMethods<Config>>(
		module: string | Class<Module>,
		id?: string,
	) {
		const moduleName = typeof module === "string" ? module : module.name;
		const allConfigs = this.options.modules.get(moduleName);

		if (id) {
			return allConfigs?.find((config) => config.id === id)?.config;
		}

		return allConfigs?.map((c) => c.config);
	}

	setModuleConfig<Config, Module extends VermiModuleMethods<Config>>(
		module: Class<Module> | string,
		config: Module["config"][number],
	): void;
	setModuleConfig<Config, Module extends VermiModuleMethods<Config>>(
		config: ModuleConfig<Module>,
	): void;
	setModuleConfig<Config, Module extends VermiModuleMethods<Config>>(
		module: Class<Module> | string | ModuleConfig<Module>,
		config?: Module["config"][number],
	): void {
		const moduleName =
			typeof module === "string"
				? module
				: isClass(module)
					? module.name
					: module.module.name;
		const existing = this.options.modules.get(moduleName) || [];

		if (isClass(module)) {
			existing.push({ module, config });
			this.options.modules.set(module.name, existing);
			return;
		}

		if (typeof module === "string") {
			if (!existing?.find((m) => m.module.name === module)) {
				throw new Error(`Module ${module} is not configured.`);
			}
			existing.push({ module: existing[0].module, config });
			this.options.modules.set(module, existing);
			return;
		}

		existing.push(module);

		this.options.modules.set(module.module.name, existing);
	}
}
