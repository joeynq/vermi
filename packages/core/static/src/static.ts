import type { ConfigureModule } from "@vermi/core";
import { StaticModule, type StaticModuleOptions } from "./StaticModule";

export const statics = (
	assetsDir: string,
	options: Omit<StaticModuleOptions, "assetsDir">,
): ConfigureModule<StaticModule, StaticModuleOptions[]> => [
	StaticModule,
	[{ ...options, assetsDir }],
];
