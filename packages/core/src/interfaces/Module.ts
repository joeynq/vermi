import type { Serve } from "bun";

export interface ModuleConstructor<Config = unknown> {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	new (...args: any[]): Module<Config>;
}
export interface Module<Config = unknown> {
	id: string;
	config: Config;
}

interface YabInternalOptions {
	modules: Record<string, unknown>;
}

export type YabOptions = YabInternalOptions & Omit<Serve, "fetch">;
