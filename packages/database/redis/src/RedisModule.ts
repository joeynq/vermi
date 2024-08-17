import {
	type AppContext,
	AppHook,
	Config,
	Logger,
	type LoggerAdapter,
	Module,
	VermiModule,
	asValue,
} from "@vermi/core";
import { Redis, type RedisOptions } from "ioredis";

export type RedisModuleOptions = {
	name?: string;
	options: RedisOptions;
};

@Module()
export class RedisModule extends VermiModule<RedisModuleOptions[]> {
	@Logger() protected logger!: LoggerAdapter;
	@Config() public config!: RedisModuleOptions[];

	@AppHook("app:init")
	async init(context: AppContext) {
		for (const { name = "default", options } of this.config) {
			const instance = new Redis(options);
			context.register(`redis.${name}`, asValue(instance));
			this.logger.info(`Redis module initialized with ${name}.`);
		}
	}
}
