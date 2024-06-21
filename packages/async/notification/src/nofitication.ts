import type { ConfigureModule } from "@vermi/core";
import { NotificationModule } from "./NotificationModule";
import type { AdapterConfigMap, Templates } from "./interfaces";

export const notification = <T extends Templates>(
	channels: Partial<AdapterConfigMap>,
	templates: T,
): ConfigureModule<NotificationModule<T>> => {
	return [
		NotificationModule,
		{
			channels,
			templates,
		},
	];
};
