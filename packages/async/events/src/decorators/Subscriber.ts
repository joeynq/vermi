import { Deps, Injectable, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { eventStore } from "../stores";

export interface SubscriberOptions {
	deps?: Class<any>[];
}

export function Subscriber(
	group = "default",
	{ deps = [] }: SubscriberOptions = {},
) {
	return useDecorators(
		(target: any) => {
			eventStore.apply(target).setGroup(group);
		},
		Injectable("SINGLETON"),
		Deps(...deps),
	);
}
