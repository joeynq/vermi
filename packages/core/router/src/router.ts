import type { ConfigureModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { RouterModule, type RouterOptions } from "./RouterModule";
import type { SlashedPath } from "./interfaces";

export const router = (
	mount: SlashedPath,
	controllers: Class<any>[],
	options?: RouterOptions,
): ConfigureModule<RouterModule> => [
	RouterModule,
	[{ controllers, options, mount }],
];
