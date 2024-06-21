import type { Class } from "@vermi/utils";
import { dependentStore } from "../store";

export function Deps(...deps: Class<any>[]): ClassDecorator {
	return (target: any) => {
		if (deps.length === 0) {
			return;
		}
		dependentStore.apply(target).addDependents(...deps);
	};
}
