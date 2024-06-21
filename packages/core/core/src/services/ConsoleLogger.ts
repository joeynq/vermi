import { format, omitUndefined, stringify } from "@vermi/utils";
import { Chalk, type ChalkInstance } from "chalk";
import { logLevelOrder } from "../enum";
import type { LogLevel, LogOptions } from "../interfaces";
import { BaseLogger } from "./BaseLogger";

Error.stackTraceLimit = 10;

let chalk = new Chalk();

export type ConsoleLoggerOptions = {
	formatDate: (date: Date) => string;
};

export class ConsoleLogger extends BaseLogger<Console> {
	log = console;

	get level(): LogLevel {
		return this.opts.level ?? "info";
	}

	get chalk(): ChalkInstance {
		return chalk;
	}

	opts: LogOptions<ConsoleLoggerOptions>;

	constructor(opts?: Partial<LogOptions<Partial<ConsoleLoggerOptions>>>) {
		super();
		this.opts = {
			level: "info",
			stackTrace: true,
			noColor: false,
			...(opts ? omitUndefined(opts) : {}),
			options: {
				formatDate: (date: Date) =>
					date.toISOString().slice(0, 23).replace("T", " "),
				...(opts?.options ? omitUndefined(opts.options) : {}),
			},
		};

		chalk = new Chalk({ level: !opts?.noColor ? 1 : 0 });
	}

	createChild() {
		return console;
	}

	info(arg0: any, ...args: any): void {
		this.writeLog("info", arg0, ...args);
	}

	error(arg0: any, ...args: any): void {
		this.writeLog("error", arg0, ...args);
	}

	warn(arg0: any, ...args: any): void {
		this.writeLog("warn", arg0, ...args);
	}

	debug(arg0: any, ...args: any): void {
		this.writeLog("debug", arg0, ...args);
	}

	trace(arg0: any, ...args: any): void {
		this.writeLog("trace", arg0, ...args);
	}

	protected writeLog(level: LogLevel, arg0: any, ...args: any[]) {
		if (!this.allowLevel(level)) return;

		const log = Object.hasOwn(this.log, level)
			? // @ts-expect-error
				this.log[level]
			: this.log.log.bind(this.log);

		const logObject = typeof arg0 === "object" ? arg0 : undefined;
		const message = logObject ? args[0] : arg0;
		const others = logObject ? args.slice(1) : args;

		let stack: string | undefined = undefined;
		let errorLevel: LogLevel | undefined = undefined;

		if (logObject instanceof Error && logObject.stack && this.opts.stackTrace) {
			stack = logObject.stack;
			errorLevel = "error";
		}

		const formatted =
			typeof message === "string"
				? format(message, others)
				: stringify(message, null, 2);

		const logEntry = this.logEntry(errorLevel ?? level, `${formatted}`);

		if (stack && this.opts.stackTrace) {
			log(logObject, logEntry, stack);
		} else {
			log(logEntry);
		}
	}

	protected logEntry(level: LogLevel, message: string) {
		const date = chalk.grey(this.opts.options?.formatDate(new Date()));

		const coloredLevels = {
			error: this.chalk.red,
			warn: this.chalk.yellow,
			debug: this.chalk.yellow,
			info: this.chalk.green,
			trace: this.chalk.green,
			fatal: this.chalk.red,
			silent: (message: string) => undefined,
		};

		const coloredLevel = coloredLevels[level](level.toUpperCase());

		const coloredMessage =
			level === "error" || level === "fatal"
				? this.chalk.red(message)
				: message;

		if (this.context?.traceId) {
			const traceId = this.chalk.whiteBright(`${this.context.traceId}`);

			return this.chalk.cyan(
				`${date} ${coloredLevel} ${traceId} ${coloredMessage}`,
			);
		}
		return this.chalk.cyan(`${date} ${coloredLevel} ${coloredMessage}`);
	}

	protected allowLevel(level: LogLevel) {
		if (this.level === "silent") return false;

		const allowed = logLevelOrder.indexOf(this.level);
		const current = logLevelOrder.indexOf(level);

		return current >= allowed;
	}
}
