import { createModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { EventModule } from "./EventModule";
import { EventEmitterKey } from "./consts";
import type { EventInitOptions } from "./interfaces";
import { AbstractConsumer, TseepConsumer } from "./services";

export const events = <Adapter extends AbstractConsumer<any>>(
	subscribers: Class<any>[],
	options?: EventInitOptions<Adapter>,
) => {
	const { group = "default", adapter, ...rest } = options || {};

	return createModule(EventModule<Adapter>)({
		adapter: {
			...adapter,
			name: group,
			provider: adapter?.class ? adapter?.provider : EventEmitterKey,
			class: adapter?.class || (TseepConsumer as Class<Adapter>),
		},
		...rest,
		group,
		subscribers,
	});
};
