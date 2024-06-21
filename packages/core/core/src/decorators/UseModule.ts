import type { Class } from "@vermi/utils";
import type { VermiModule } from "../services";
import { submoduleStore } from "../store";

export function UseModule<M extends VermiModule<any>>(
	module: Class<M>,
	options: M["config"],
): ClassDecorator;
export function UseModule<O, M extends VermiModule<O>>(
	module: [Class<M>, M["config"]],
): ClassDecorator;
export function UseModule<O, M extends VermiModule<O>>(
	module: Class<M> | [Class<M>, M["config"]],
	options?: M["config"],
) {
	return (target: any) => {
		const [m, o] = Array.isArray(module) ? module : [module, options];
		submoduleStore.apply(target).useModule(m, o);
	};
}
