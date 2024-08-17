import type { Class, Dictionary } from "@vermi/utils";
import type { TLSOptions, WebSocketHandler } from "bun";
import type { VermiModule } from "../services";
import type { LogOptions } from "./LoggerAdapter";

export interface ModuleConfig<Config> {
	module: Class<VermiModule<Config>>;
	config: Config;
}

export interface AppOptions<Log extends object = ConsoleOptions> {
	port?: string | number;
	hostname?: string;
	modules: Map<string, ModuleConfig<any>>;
	env?: Dictionary;
	reusePort?: boolean;
	tls?: TLSOptions;
	log?: LogOptions<Log>;
	websocket?: WebSocketHandler<any>;
}

export type ConfigureModule<
	Module extends VermiModule<any>,
	Config extends Module["config"] = Module["config"],
> = [Class<Module>, Config];
