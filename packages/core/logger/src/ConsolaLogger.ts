import { BaseLogger, type LoggerContext } from "@vermi/core";
import { type ConsolaInstance, type LogLevel } from "consola";

const getLogType = (level: LogLevel) => {
	switch (level) {
		case 0:
			return "silent";
		case 1:
			return "fatal";
		case 2:
			return "error";
		case 3:
			return "warn";
		case 4:
			return "info";
		case 5:
			return "debug";
		default:
			return "info";
	}
};

export class ConsolaLogger extends BaseLogger<ConsolaInstance> {
	get level() {
		return getLogType(this.provider.level);
	}

	constructor() {
		super();
		this.provider.wrapConsole();
	}

	createChild(context: LoggerContext) {
		const child = this.provider.withTag(context.traceId);
		child.wrapConsole();
		return child;
	}
}
