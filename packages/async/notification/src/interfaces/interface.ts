import type { Dictionary } from "@vermi/utils";
import type { FC } from "react";
import type { AdapterConfigMap } from "./channelMap";

export abstract class NotificationAdapter<
	Config extends Dictionary = Dictionary,
> {
	abstract send(options: Config & { content: string }): Promise<void>;
}

export type Templates = Record<string, FC<any>>;

export type SendWithTemplateOptions<C extends keyof AdapterConfigMap> = {
	template: string;
	data: any;
} & { channel: C } & AdapterConfigMap[C];

export type SendWithContentOptions = {
	content: string;
} & { channel: string };

export type NotificationEvent = Bun.MessageEvent<{
	config: any;
	sendOptions: SendWithContentOptions;
}>;
