import type { AdapterConfig } from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { AbstractConsumer } from "../services";

export interface EventConfig<Adapter extends AbstractConsumer<any>>
	extends AdapterConfig<Adapter> {
	group?: string;
	traceId?: <Payload>(payload: Payload) => string;
	subscribers: Class<any>[];
}

export type EventInitOptions<Adapter extends AbstractConsumer<any>> = Omit<
	EventConfig<Adapter>,
	"subscribers"
> & {
	group?: string;
};
