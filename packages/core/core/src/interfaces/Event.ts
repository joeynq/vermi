import type { EnumValues, MaybePromiseFunction } from "@vermi/utils";

export type EventPayload<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> = Parameters<EventMap[Event]>;

export type EventResult<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> = ReturnType<EventMap[Event]>;
