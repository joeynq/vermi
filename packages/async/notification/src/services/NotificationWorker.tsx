import { parentPort } from "node:worker_threads";
import type { AnyClass } from "../../../../core/utils/dist";
import type { NotificationAdapter, NotificationEvent } from "../interfaces";

declare let self: Worker;

const log = (message: any) => {
	parentPort?.postMessage(message);
};

self.addEventListener("message", async (event: NotificationEvent) => {
	const { channel, content, ...rest } = event.data.sendOptions;

	const Adapter = (await import(`../channels/${channel}`).catch(log)) as {
		default: AnyClass<NotificationAdapter>;
	};

	await new Adapter.default(event.data.config).send({ content, ...rest });

	log("done");
});
