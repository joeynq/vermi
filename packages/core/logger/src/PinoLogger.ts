import {
	BaseLogger,
	type LogLevel,
	type LogOptions,
	type LoggerContext,
} from "@vermi/core";
import type { Dictionary } from "@vermi/utils";
import Pino, { type Logger, type LoggerOptions } from "pino";

export class PinoLogger extends BaseLogger<Logger> {
	options: LogOptions<LoggerOptions & Dictionary>;

	get level() {
		return this.log.level as LogLevel;
	}

	constructor(options: Partial<LogOptions<LoggerOptions & Dictionary>> = {}) {
		super();

		this.options = {
			level: "info",
			stackTrace: true,
			noColor: false,
			options: {},
			...options,
		};
		this.setLogger(Pino({ base: {} }));
	}

	createChild(context: LoggerContext) {
		return this.log.child(context);
	}
}
