import type { ConfigureModule } from "@vermi/core";
import { MikroOrmModule, type MikroOrmModuleConfig } from "./MikroOrmModule";

export const mikroOrm = (
	config: MikroOrmModuleConfig,
): ConfigureModule<MikroOrmModule> => [MikroOrmModule, config];
