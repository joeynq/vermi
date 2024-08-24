import { type AdapterConfig, type WithAdapter, withAdapter } from "@vermi/core";
import { ensure } from "@vermi/utils";
import type { NotificationAdapter, Templates } from "./interfaces";
import { NotificationService } from "./services";

declare module "@vermi/core" {
	interface _AppContext {
		notification: NotificationService;
	}
}

export interface NotificationModuleConfig<
	Adapter extends NotificationAdapter<any, any>,
> extends AdapterConfig<Adapter> {
	channel: string;
	templates: Templates;
}

export const notification = <Adapter extends NotificationAdapter<any, any>>(
	channel: string,
	options: Omit<WithAdapter<Adapter>, "channel">,
) => {
	ensure(options.adapter?.class, "Adapter is required");
	const {
		adapter: { class: adapterClass, provider },
		...rest
	} = options;
	return withAdapter<NotificationModuleConfig<Adapter>, Adapter>(
		adapterClass,
		provider,
		{
			...rest,
			channel,
		},
	);
};
