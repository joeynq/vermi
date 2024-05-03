import type { Server } from "bun";
import type { Yab } from "../Yab";
import type { Context, InjectionToken } from "../interfaces";

export enum YabEvents {
	OnExit = "app:exit",
	OnStarted = "app:started",
	OnRequest = "app:request",
	OnResponse = "app:response",
	OnInit = "app:init",
}

type ContainerUtils = {
	resolveValue: <T>(token: InjectionToken<T>) => T;
	registerValue: <T>(token: InjectionToken<T>, value: T) => void;
};

export interface InitContext {
	container: ContainerUtils;
	app: Yab;
}

export type YabEventMap = {
	[YabEvents.OnExit]: (server: Server, app: Yab) => Promise<void>;
	[YabEvents.OnStarted]: (server: Server, app: Yab) => Promise<void>;
	[YabEvents.OnInit]: (initContext: InitContext) => Promise<void>;
	[YabEvents.OnRequest]: (context: Context) => Promise<Response>;
	[YabEvents.OnResponse]: (
		context: Context,
		response: Response,
	) => Promise<Response>;
};
