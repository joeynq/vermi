import { type Class, deepMerge } from "@vermi/utils";
import type { VermiModule } from "../services";
import { createStore } from "../utils";

export const SubmoduleStoreKey = Symbol("SubmoduleStoreKey");

export type SubmoduleStore<O, M extends VermiModule<O>> = {
	module: Class<M>;
	options: O;
};

export type SubmoduleStoreAPI = {
	useModule: <O, M extends VermiModule<O>>(
		module: Class<M>,
		options: O,
	) => void;
};

export const submoduleStore = createStore<
	SubmoduleStore<any, any>[],
	SubmoduleStoreAPI
>(
	SubmoduleStoreKey,
	(_, get, set) => ({
		useModule(module, options) {
			const current = get();
			const existing = current.findIndex(
				(item) => item.module.name === module.name,
			);

			if (existing !== -1) {
				current[existing].options = deepMerge(
					current[existing].options,
					options,
				);

				set(current);
			} else {
				set([...current, { module, options }]);
			}
		},
	}),
	() => [],
);
