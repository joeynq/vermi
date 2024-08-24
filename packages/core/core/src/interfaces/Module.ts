import type { Class } from "@vermi/utils";
import type { AppContext } from "./Context";

export type ModuleHook = "init" | "destroy";

export interface WithHooks {
	hooks?: {
		[event in ModuleHook]?: (
			context: AppContext,
			config: this,
		) => Promise<void>;
	};
}

export interface VermiModuleMethods<Options> {
	config: Options[];
}

export interface ModuleConfig<Module extends VermiModuleMethods<any>> {
	id?: string;
	module: Class<Module>;
	config: Module["config"][number];
}
