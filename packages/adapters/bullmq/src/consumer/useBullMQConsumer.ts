import type { WithAdapter } from "@vermi/core";
import { BullMQConsumer } from "./BullMQConsumer";

export const useBullMQConsumer = (
	queueName: string,
	options?: Omit<WithAdapter<BullMQConsumer>["adapter"], "class" | "name">,
): WithAdapter<BullMQConsumer>["adapter"] => {
	return {
		class: BullMQConsumer,
		name: queueName,
		...options,
	};
};
