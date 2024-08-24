import type { Class, MaybePromise } from "@vermi/utils";
import type { AppContext } from "./Context";

export interface AdapterMethods<Provider> {
	readonly type: string;
	provider: Provider;
}

export interface WithAdapter<Adapter extends AdapterMethods<any>> {
	adapter: {
		name: string;
		class: Class<Adapter>;
		provider?:
			| string
			| Adapter["provider"]
			| ((context: AppContext) => Adapter["provider"]);
		onInit?: (instance: Adapter["provider"]) => MaybePromise<void>;
		onDestroy?: (context: Adapter["provider"]) => MaybePromise<void>;
	};
}
