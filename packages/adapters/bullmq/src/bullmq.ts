import { provider } from "@vermi/core";
import { type ConnectionOptions, Queue, type QueueOptions } from "bullmq";
import { Redis } from "ioredis";

export interface BullMQOptions extends Omit<QueueOptions, "connection"> {
	connection?: string | ConnectionOptions;
}

export const bullmq = (group: string, options?: BullMQOptions) => {
	return provider<Queue>(group, (context) => {
		const { connection: redis, ...rest } = options || {};
		if (typeof redis === "string") {
			return new Queue(group, {
				connection: context.resolve<Redis>(redis),
				...rest,
			});
		}

		return new Queue(group, { connection: redis || {}, ...rest });
	});
};
