import type { ConfigureModule } from "@vermi/core";
import { WsModule, type WsModuleOptions } from "./WsModule";

export const ws = (config: WsModuleOptions): ConfigureModule<WsModule> => [
	WsModule,
	[config],
];
