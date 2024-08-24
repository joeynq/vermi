import type { Class } from "@vermi/utils";
import type { VermiModuleMethods } from "../interfaces";
import { submoduleStore } from "../store";

export function UseModule<M extends VermiModuleMethods<any>>(
	module: Class<M>,
	options: M["config"][number],
): ClassDecorator {
	return (target: any) => {
		const [m, o] = Array.isArray(module) ? module : [module, options];
		submoduleStore.apply(target).useModule(m, o);
	};
}
