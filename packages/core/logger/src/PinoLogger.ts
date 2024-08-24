import { BaseLogger, type LogLevel, type LoggerContext } from "@vermi/core";
import { type Logger } from "pino";

export class PinoLogger extends BaseLogger<Logger> {
	get level() {
		return this.provider.level as LogLevel;
	}
	createChild(context: LoggerContext) {
		return this.provider.child(context);
	}
}
