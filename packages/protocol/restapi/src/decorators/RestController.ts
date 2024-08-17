import { useDecorators } from "@vermi/core";
import {
	Controller,
	type ControllerOptions,
	type SlashedPath,
} from "@vermi/router";
import type { Class } from "@vermi/utils";
import { PluralName } from "./Resource";

export function RestController(
	resource: Class<any>,
	options?: ControllerOptions,
) {
	return useDecorators(
		Controller(
			`/${resource.prototype[PluralName]}`.toLowerCase() as SlashedPath,
			options,
		),
	);
}
