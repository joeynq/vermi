import { type EntityManager, MikroORM, type Options } from "@mikro-orm/core";
import {
	type AppContext,
	AppHook,
	Config,
	InjectionScope,
	Logger,
	type LoggerAdapter,
	Module,
	VermiModule,
	asValue,
} from "@vermi/core";
import { getToken } from "./utils";

declare module "@vermi/core" {
	interface _AppContext {
		em?: MikroORM["em"];
	}
}

export type MikroOrmModuleConfig = Options;

@Module()
export class MikroOrmModule extends VermiModule<MikroOrmModuleConfig> {
	#orm!: MikroORM;

	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: MikroOrmModuleConfig;

	@AppHook("app:init")
	async init(context: AppContext) {
		this.#orm = await MikroORM.init({
			...this.config,
			context: () => context.resolve<EntityManager>("em"),
		});

		const url = new URL(this.#orm.config.getClientUrl());
		const isConnected = (await this.#orm.isConnected())
			? "successfully"
			: "unsuccessfully";

		this.logger.info(
			"MikroORM connected to database {isConnected} to {url.protocol}//{url.host}{url.pathname}{url.search}",
			{ url, isConnected },
		);

		const contextName = this.#orm.config.get("contextName");
		context.register({
			[`${getToken(contextName)}.orm`]: asValue(this.#orm),
			[`${getToken(contextName)}.em`]: {
				lifetime: InjectionScope.Scoped,
				resolve: (container) =>
					container
						.resolve<MikroORM>(`${getToken(contextName)}.orm`)
						.em.fork({ useContext: true }),
			},
		});
	}

	@AppHook("app:exit")
	async exit() {
		await this.#orm.close();
		this.logger.info("MikroORM connection closed.");
	}
}
