import type { Server } from "bun";
import type { AppContext, RequestContext } from "../interfaces";

export enum AppEvents {
	OnExit = "app:exit",
	OnStarted = "app:started",
	OnEnterContext = "app:enter-context",
	OnExitContext = "app:exit-context",
	OnRequest = "app:request",
	OnResponse = "app:response",
	OnInit = "app:init",
}

export type AppEventMap = {
	[AppEvents.OnExit]: (context: AppContext, server: Server) => Promise<void>;
	[AppEvents.OnStarted]: (context: AppContext, server: Server) => Promise<void>;
	[AppEvents.OnEnterContext]: (context: RequestContext) => Promise<void>;
	[AppEvents.OnExitContext]: (context: RequestContext) => Promise<void>;
	[AppEvents.OnInit]: (context: AppContext) => Promise<void>;
	[AppEvents.OnRequest]: (
		context: RequestContext,
		server: Server,
	) => Promise<Response>;
	[AppEvents.OnResponse]: (
		context: RequestContext,
		response: Response,
	) => Promise<Response>;
};
