import type { ConfigureModule } from "@vermi/core";
import { RemixModule, type RemixModuleOptions } from "./RemixModule";

export const remix = (
	options: RemixModuleOptions,
): ConfigureModule<RemixModule> => [RemixModule, options];
