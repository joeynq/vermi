import { createModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { RouterModule, type RouterOptions } from "./RouterModule";
import type { SlashedPath } from "./interfaces";

const routerModule = createModule(RouterModule);

export const router = (
	mount: SlashedPath,
	controllers: Class<any>[],
	options?: RouterOptions,
) => routerModule({ mount, controllers, options });
