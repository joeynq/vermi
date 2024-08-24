import { createModule } from "@vermi/core";
import { StaticModule, type StaticModuleOptions } from "./StaticModule";

export const statics = (
	assetsDir: string,
	options: Omit<StaticModuleOptions, "assetsDir">,
) => createModule(StaticModule)({ ...options, assetsDir });
