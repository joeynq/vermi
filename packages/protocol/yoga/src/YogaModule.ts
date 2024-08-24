import {
	type AppContext,
	AppHook,
	Config,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	type _AppContext,
	asValue,
} from "@vermi/core";
import type { Server } from "bun";
import {
	type YogaServerInstance,
	type YogaServerOptions,
	createYoga,
} from "graphql-yoga";

export type YogaModuleConfig<UserContext> = YogaServerOptions<
	_AppContext,
	UserContext
> & { graphqlEndpoint: string };

@Module()
export class YogaModule<
	UserContext extends Record<string, any>,
> extends VermiModule<YogaModuleConfig<UserContext>> {
	// #yoga: YogaServerInstance<_AppContext, UserContext>;

	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: YogaModuleConfig<UserContext>[];

	get endpoints() {
		return this.config.map((config) => config.graphqlEndpoint);
	}

	@AppHook("app:init")
	async onInit(context: AppContext) {
		for (const config of this.config) {
			context.register(
				`yoga:server:${config.graphqlEndpoint}`,
				asValue(createYoga(config)),
			);
		}
	}

	@AppHook("app:request")
	async init(context: RequestContext) {
		const { request, serverUrl } = context.store;
		const url = new URL(request.url, serverUrl);

		for (const endpoint of this.endpoints) {
			if (url.pathname.startsWith(endpoint)) {
				return context
					.resolve<YogaServerInstance<_AppContext, UserContext>>(
						`yoga:server:${endpoint}`,
					)
					.handleRequest(request, context.store);
			}
		}
	}

	@AppHook("app:started")
	async onStarted(_: AppContext, server: Server) {
		for (const endpoint of this.endpoints) {
			this.logger.info(
				`GraphQL Yoga server started at ${server.url}${endpoint}`,
			);
		}
	}
}
