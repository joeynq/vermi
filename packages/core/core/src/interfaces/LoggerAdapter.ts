import type { AnyFunction } from "@vermi/utils";
import type { ConsoleLogger } from "../services";
import type { AdapterMethods, WithAdapter } from "./AdapterMethods";
import type { _RequestContext } from "./Context";

export type LogLevel =
	| "info"
	| "error"
	| "warn"
	| "debug"
	| "trace"
	| "fatal"
	| "silent";

export type LoggerContext = Pick<_RequestContext, "traceId">;

export interface LogOptions<Logger extends AbstractLogger = ConsoleLogger>
	extends WithAdapter<LoggerAdapter<Logger>> {
	context?: LoggerContext;
	noColor?: boolean;
	level?: LogLevel;
	stackTrace?: boolean;
}

export interface LogFn {
	<T extends object>(obj: T, msg?: string, ...args: any[]): any;
	(obj: unknown, msg?: string, ...args: any[]): any;
	(msg: string, ...args: any[]): any;
}

export interface AbstractLogger {
	info: AnyFunction;
	error: AnyFunction;
	warn: AnyFunction;
	debug: AnyFunction;
	trace: AnyFunction;
}

export interface LoggerAdapter<Logger extends AbstractLogger = AbstractLogger>
	extends AdapterMethods<Logger> {
	type: "logger";
	provider: Logger;
	level: LogLevel;
	context?: LoggerContext;

	useContext(context: LoggerContext): LoggerAdapter<Logger>;
	setLogger(logger: Logger): void;

	info: LogFn;

	error: LogFn;

	warn: LogFn;

	debug: LogFn;

	trace: LogFn;
}
