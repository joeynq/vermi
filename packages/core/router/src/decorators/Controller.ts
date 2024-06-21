import { Deps, Injectable, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { SlashedPath } from "../interfaces";
import { routeStore } from "../stores";

export interface ControllerOptions {
	deps?: Class<any>[];
	name?: string;
}

export const Controller = (
	prefix: SlashedPath,
	{ deps = [], name }: ControllerOptions = {},
) => {
	return useDecorators(
		(target: any) => {
			routeStore.apply(target).setPrefix(prefix);
		},
		Injectable({ lifetime: "SCOPED", name }),
		Deps(...deps),
	);
};
