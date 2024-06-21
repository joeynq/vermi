import type { Dictionary } from "@vermi/utils";

export type EventExtraType<EventMap extends Dictionary, Type> =
	| keyof EventMap
	| Type;

export interface MessageDTO<
	Data,
	EventMap extends Dictionary = {},
	Type extends string = string,
> {
	sid: string;
	type: EventExtraType<EventMap, Type>;
	timestamp: Date;
	data?: Data;
}
