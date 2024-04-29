import type { Server } from "bun";
import type { Context, EnhancedContainer } from "../interfaces";
import type { Configuration } from "../services";

export enum YabEvents {
	OnStarted = "app:started",
	OnRequest = "app:request",
	OnInit = "app:init",
}

export interface InitContext {
	config: Configuration;
	container: EnhancedContainer;
}

export type YabEventMap = {
	[YabEvents.OnStarted]: (
		server: Server,
		config: Configuration,
	) => Promise<void>;
	[YabEvents.OnInit]: (initContext: InitContext) => Promise<void>;
	[YabEvents.OnRequest]: (context: Context) => Promise<Response>;
};
