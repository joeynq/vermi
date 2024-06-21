import { type Consumer, Kafka } from "kafkajs";
import type { WithConsumerConfig } from "../../EventModule";
import { KafkaConsumer } from "./KafkaConsumer";

export const useKafkaConsumer = (
	group: string,
	client: string | Consumer,
): WithConsumerConfig<Consumer>["consumer"] => {
	return {
		group,
		adapter: KafkaConsumer,
		client(ctx) {
			if (typeof client === "string") {
				const kafka = ctx.resolve<Kafka>(client);
				return kafka.consumer({ groupId: group });
			}
			return client;
		},
	};
};
