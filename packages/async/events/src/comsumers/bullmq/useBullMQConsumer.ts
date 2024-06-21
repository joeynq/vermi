import type { Redis } from "ioredis";
import type { WithConsumerConfig } from "../../EventModule";
import { BullMQConsumer } from "./BullMQConsumer";

export const useBullMQConsumer = (
	queueName: string,
	client?: Redis,
): WithConsumerConfig<Redis>["consumer"] => {
	return {
		group: queueName,
		adapter: BullMQConsumer,
		client(ctx) {
			if (client) {
				return client;
			}
			return ctx.resolve<Redis>(queueName);
		},
	};
};
