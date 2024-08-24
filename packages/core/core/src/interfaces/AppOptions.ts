import type { Dictionary } from "@vermi/utils";
import type { TLSOptions, WebSocketHandler } from "bun";
import type { VermiModuleMethods } from "../interfaces";
import type { LogOptions } from "./LoggerAdapter";
import type { ModuleConfig } from "./Module";

export interface AppOptions {
	port?: string | number;
	hostname?: string;
	modules: Map<string, Array<ModuleConfig<VermiModuleMethods<any>>>>;
	env?: Dictionary;
	reusePort?: boolean;
	tls?: TLSOptions;
	log?: Partial<LogOptions>;
	websocket?: WebSocketHandler<any>;
}
