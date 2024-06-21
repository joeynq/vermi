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
import { type Class, tryRun } from "@vermi/utils";
import type { JWTVerifyResult } from "jose";
import type { Strategy, StrategyOptions } from "./strategies";

declare module "@vermi/core" {
	interface _RequestContext {
		token: string | undefined;
		verifyToken<T>(): Promise<JWTVerifyResult<T>>;
		userId: string | undefined;
		authStrategies: Record<string, Strategy<any>>;
	}
}

export type AuthModuleConfig<Config, S extends Class<Strategy<Config>>> = {
	name: string;
	strategy: S;
	config: Omit<StrategyOptions<Config>, "cache">;
	cache?: string;
}[];

type InitStatus = "success" | "error";

@Module()
export class AuthModule<
	Config,
	S extends Class<Strategy<Config>>,
> extends VermiModule<AuthModuleConfig<Config, S>> {
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: AuthModuleConfig<Config, S>;

	@AppHook("app:init")
	async onInit(context: AppContext) {
		const config = this.config;

		const logs: { strategy: string; name: string; status: InitStatus }[] = [];

		const toBeRegistered: Record<string, ReturnType<typeof asValue<any>>> = {};
		for (const { strategy, cache, name, config: strategyConf } of config) {
			let status: "success" | "error" = "success";

			const [error] = await tryRun(async () => {
				const instance = new strategy({
					...strategyConf,
					cache: cache ? context.resolve(`cache.${cache}`) : undefined,
				});
				await instance.init?.();
				toBeRegistered[`auth.${name}`] = asValue(instance);
			});

			if (error) {
				status = "error";
				this.logger.error(error, `Error initializing auth strategy ${name}`);
			}

			logs.push({ strategy: strategy.name, name, status });
		}

		context.register(toBeRegistered);
		this.logger.info("Auth strategies initialized");
	}
}
