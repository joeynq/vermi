import {
	type AppContext,
	AppHook,
	Config,
	Logger,
	type LoggerAdapter,
	Module,
	VermiModule,
	asClass,
} from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { CacheAdapter } from "./interfaces";

export type CacheModuleOptions<
	Connection,
	Adapter extends Class<CacheAdapter<any, Connection>>,
> = {
	name?: string;
	adapter: Adapter;
	connection?: string | ((context: AppContext) => Connection);
	clearOnStart?: boolean;
};

@Module()
export class CacheModule<
	Connection,
	Adapter extends Class<CacheAdapter<any, Connection>>,
> extends VermiModule<CacheModuleOptions<Connection, Adapter>[]> {
	@Logger() protected logger!: LoggerAdapter;
	@Config() public config!: CacheModuleOptions<Connection, Adapter>[];

	@AppHook("app:init")
	async init(context: AppContext) {
		for (const { name = "default", adapter, clearOnStart, connection } of this
			.config) {
			const resolver = asClass(adapter);
			const instance = context.build(resolver);

			instance.connection =
				typeof connection === "string"
					? context.resolve<Connection>(connection)
					: connection?.(context);

			await instance.init?.();

			if (clearOnStart) {
				this.logger.info(`Clearing cache on start for ${name}.`);
				await instance.clear();
			}
			context.register(`cache.${name}`, resolver);
			this.logger.info(
				`Cache module initialized with ${name}. Using ${connection}`,
			);
		}
	}
}
