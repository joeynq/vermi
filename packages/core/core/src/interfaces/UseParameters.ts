import type { Class } from "@vermi/utils";
import type { VermiModuleMethods } from "./Module";

export interface UseParameters<Module extends VermiModuleMethods<any>> {
	module: Class<Module>;
	config: Module["config"][number];
}
