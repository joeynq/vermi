import { Database } from "bun:sqlite";
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

export type SqliteModuleOptions = {
	fileName?: string;
	options?: ConstructorParameters<typeof Database>[1];
};

@Module()
export class SqliteModule extends VermiModule<SqliteModuleOptions[]> {
	@Logger() protected logger!: LoggerAdapter;
	@Config() public config!: SqliteModuleOptions[];

	@AppHook("app:init")
	async init(context: AppContext) {
		for (const { fileName = ":memory:", options } of this.config) {
			const instance = new Database(fileName, options);
			context.register(`sqlite.${fileName}`, asValue(instance));
			this.logger.info(`Sqlite module initialized in ${fileName}.`);
		}
	}
}
