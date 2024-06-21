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
import { DataSource, type DataSourceOptions } from "typeorm";

declare module "@vermi/core" {
	interface _AppContext {
		dataSources: Record<string, DataSource>;
	}
}

export type TypeormModuleConfig = {
	[key: string]: DataSourceOptions;
};

@Module()
export class TypeormModule extends VermiModule<TypeormModuleConfig> {
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: TypeormModuleConfig;

	@AppHook("app:init")
	async init(context: AppContext) {
		const config = this.config;

		const dataSources = Object.keys(config).reduce(
			(acc, key) => {
				const dataSource = new DataSource(config[key]);
				acc[key] = dataSource;
				return acc;
			},
			{} as Record<string, DataSource>,
		);

		const results = await Promise.all(
			Object.keys(dataSources).map((key) => [
				key,
				dataSources[key].initialize(),
			]),
		);

		for (const [key, result] of results) {
			if (result) {
				this.logger.info(`Typeorm connected to database ${key} successfully`);
			} else {
				this.logger.error(`Typeorm failed to connect to database ${key}`);
			}
		}

		context.register("dataSources", asValue(dataSources));
	}

	@AppHook("app:exit")
	async exit(context: AppContext) {
		const dataSources = context.store.dataSources;

		await Promise.all(
			Object.keys(dataSources).map((key) => dataSources[key].destroy()),
		);

		this.logger.info("Typeorm disconnected from all databases");
	}
}
