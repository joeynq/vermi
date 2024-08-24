import type { AdapterMethods } from "@vermi/core";
import type { FC } from "react";

export abstract class NotificationAdapter<Provider, SendOptions>
	implements AdapterMethods<Provider>
{
	provider!: Provider;
	type = "notification";
	abstract send(content: string, options: SendOptions): Promise<void>;
}

export type Templates = Record<string, FC<any>>;

// export type SendWithTemplateOptions<C extends keyof AdapterConfigMap> = {
// 	template: string;
// 	data: any;
// } & { channel: C } & AdapterConfigMap[C];

// export type SendWithContentOptions = {
// 	content: string;
// } & { channel: string };

// export type NotificationEvent = Bun.MessageEvent<{
// 	config: any;
// 	sendOptions: SendWithContentOptions;
// }>;
