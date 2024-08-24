import type { Dictionary, MaybePromiseFunction } from "@vermi/utils";
import type { AwilixContainer } from "awilix";
import type { SocketAddress } from "bun";
import type { Vermi } from "../Vermi";
import type { Configuration, ContextService, Hooks } from "../services";
import type { AppOptions } from "./AppOptions";
import type { AbstractLogger, LoggerAdapter } from "./LoggerAdapter";

export type InjectionToken<T> = string | symbol | (new (...args: any[]) => T);

export enum InjectionScope {
	Singleton = "SINGLETON",
	Transient = "TRANSIENT",
	Scoped = "SCOPED",
}

export interface EnhancedContainer<Context extends object>
	extends AwilixContainer<Context> {
	expose(): ExposedContext<Context>;
	createEnhancedScope<T>(): EnhancedContainer<Context & T>;
}

export interface _AppContext {
	env: Dictionary<unknown>;
	appConfig: AppOptions;
	app: Vermi;
	logger: LoggerAdapter<AbstractLogger>;
	hooks: Hooks<Dictionary<string>, Dictionary<MaybePromiseFunction>>;
	configuration: Configuration;
	contextService: ContextService;
	[key: string]: unknown;
}

export interface _RequestContext extends _AppContext {
	request: Request;
	traceId: string;
	serverUrl: string;
	userIp?: SocketAddress;
	userAgent?: string;
}

export type ExposedContext<Context extends object = _RequestContext> = {
	store: Context;
	registered: () => string[];
	resolve: <T>(token: InjectionToken<T>) => T;
	register: EnhancedContainer<Context>["register"];
	build: EnhancedContainer<Context>["build"];
};

export type AppContext = ExposedContext<_AppContext>;

export type RequestContext = ExposedContext<_RequestContext>;
