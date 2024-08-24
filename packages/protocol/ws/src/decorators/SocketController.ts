import { Deps, Injectable, useDecorators } from "@vermi/core";
import { Subscriber } from "@vermi/events";
import type { Class } from "@vermi/utils";

export interface SocketControllerOptions {
	deps?: Class<any>[];
}

export const SocketController = (
	namespace: `/${string}`,
	{ deps = [] }: SocketControllerOptions = {},
) => {
	return useDecorators(
		Subscriber(namespace),
		Injectable("SINGLETON"),
		Deps(...deps),
	);
};
