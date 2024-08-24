import { clone, format } from "@vermi/utils";
import type {
	AbstractLogger,
	LogLevel,
	LoggerAdapter,
	LoggerContext,
} from "../interfaces";

export abstract class BaseLogger<Logger extends AbstractLogger>
	implements LoggerAdapter<Logger>
{
	type = "logger" as const;
	provider!: Logger;
	abstract level: LogLevel;

	context?: LoggerContext;

	protected abstract createChild(context: any): Logger;

	setLogger(logger: Logger) {
		this.provider = logger;
	}

	useContext(context: LoggerContext) {
		const child = this.createChild(context);
		const newInstance = clone(this, {});
		newInstance.setLogger(child);
		newInstance.context = context;

		return newInstance;
	}

	info(arg: any, ...args: any[]) {
		this.provider.info(...this.#formatMessage(arg, ...args));
	}

	error(arg: any, ...args: any[]) {
		this.provider.error(...this.#formatMessage(arg, ...args));
	}

	warn(arg: any, ...args: any[]) {
		this.provider.warn(...this.#formatMessage(arg, ...args));
	}

	debug(arg: any, ...args: any[]) {
		this.provider.debug(arg, ...args);
	}

	trace(arg: any, ...args: any[]) {
		this.provider.trace(...this.#formatMessage(arg, ...args));
	}

	#formatMessage(arg: any, ...args: any[]): any[] {
		if (
			typeof arg === "string" &&
			args.length > 0 &&
			typeof args[0] === "object"
		) {
			const message = format(arg, args[0]);
			return [message, ...args.slice(1)];
		}
		if (
			typeof arg === "object" &&
			args.length > 0 &&
			typeof args[0] === "string"
		) {
			const [message, ...rest] = this.#formatMessage(args[0], ...args.slice(1));
			return [arg, message, ...rest];
		}

		return [arg, ...args];
	}
}
