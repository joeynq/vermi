import { Deps, Injectable, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { wsHandlerStore } from "../stores";

export interface SocketControllerOptions {
	deps?: Class<any>[];
}

export const SocketController = (
	channel: `/${string}`,
	{ deps = [] }: SocketControllerOptions = {},
) => {
	return useDecorators(
		(target: any) => {
			wsHandlerStore.apply(target).setChannel(channel);
		},
		Injectable("SCOPED"),
		Deps(...deps),
	);
};
