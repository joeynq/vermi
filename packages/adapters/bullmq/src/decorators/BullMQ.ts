import { Inject } from "@vermi/core";

function Queue(group: string) {
	return Inject(group);
}

// BullMQ.Queue = Queue;
export declare namespace BullMQ {
	export { Queue };
}
