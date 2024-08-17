import type { ConfigureModule } from "@vermi/core";
import { HelmetModule, type HelmetOptions } from "./HelmetModule";

export const helmet = (
	config: HelmetOptions = {},
): ConfigureModule<HelmetModule> => [HelmetModule, config];
