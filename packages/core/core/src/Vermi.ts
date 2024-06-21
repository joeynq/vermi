import {
	type Class,
	deepMerge,
	ensure,
	pathIs,
	tryRun,
	uuid,
} from "@vermi/utils";
import { InjectionMode, Lifetime, asValue, createContainer } from "awilix";
import type { Server } from "bun";
import { Module } from "./decorators";
import { type AppEventMap, AppEvents } from "./events";
import { HttpException } from "./exceptions";
import type {
	AbstractLogger,
	AppContext,
	AppOptions,
	EnhancedContainer,
	LoggerAdapter,
	_AppContext,
	_RequestContext,
} from "./interfaces";
import {
	Configuration,
	ConsoleLogger,
	type ConsoleLoggerOptions,
	ContextService,
	Hooks,
	VermiModule,
} from "./services";
import { submoduleStore } from "./store";
import { enhance, registerHooks, registerProviders } from "./utils";

@Module({ deps: [Configuration, Hooks] })
class AppModule {}

export class Vermi<Log extends object = ConsoleLoggerOptions> {
	#logger: LoggerAdapter;
	#container = enhance(
		createContainer<_AppContext>({
			injectionMode: InjectionMode.CLASSIC,
			strict: true,
		}),
	);

	#customContext?: (ctx: _RequestContext) => Record<string, unknown>;

	#options: AppOptions<Log>;

	#context = new ContextService();

	get hooks() {
		const hooks =
			this.#container.resolve<Hooks<typeof AppEvents, AppEventMap>>("hooks");
		ensure(hooks);
		return hooks;
	}

	constructor(options?: Partial<AppOptions<Log>>) {
		this.#logger = new ConsoleLogger(options?.log);

		this.#options = {
			modules: new Map(),
			...options,
		};
	}

	#registerServices() {
		this.#container.register({
			appConfig: asValue(this.#options),
			_logger: asValue(this.#logger),
			env: asValue(this.#options?.env || {}),
			app: asValue(this),
			logger: {
				resolve: (c) => {
					const _logger = c.resolve<LoggerAdapter>("_logger");

					if (c.hasRegistration("traceId")) {
						return _logger.useContext({
							traceId: c.resolve("traceId"),
						});
					}
					return _logger;
				},
				lifetime: Lifetime.SCOPED,
			},
			contextService: asValue(this.#context),
		});
	}

	#initModules(context: AppContext) {
		const modules = Array.from(this.#options.modules.values()).map(
			({ module }) => module,
		);

		registerProviders(AppModule, ...modules);
		registerHooks(context, AppModule, ...modules);
	}

	#runInRequestContext(
		container: EnhancedContainer<_AppContext>,
		request: Request,
		server: Server,
	) {
		return new Promise<Response>((resolve) => {
			this.#context.runInContext<_RequestContext, void>(
				container.createEnhancedScope(),
				async (stored: EnhancedContainer<_RequestContext>) => {
					const [error, response] = await tryRun(async () => {
						stored.register({
							traceId: asValue(request.headers.get("x-request-id") ?? uuid()),
							request: asValue(request),
							serverUrl: asValue(server.url.toJSON()),
							userIp: asValue(server.requestIP(request) || undefined),
							userAgent: asValue(
								request.headers.get("user-agent") ?? undefined,
							),
						});

						const hooks = stored.cradle.hooks as Hooks<
							typeof AppEvents,
							AppEventMap
						>;

						for (const [key, value] of Object.entries(
							this.#customContext?.(stored.cradle) || {},
						)) {
							stored.register(key, asValue(value));
						}

						await hooks.invoke(AppEvents.OnEnterContext, [stored.expose()]);

						const result = await hooks.invoke(
							AppEvents.OnRequest,
							[stored.expose(), server],
							{
								breakOn: "result",
							},
						);

						const defaultResponse = pathIs(request.url, "/")
							? new Response("OK", { status: 200 })
							: new Response("Not Found", { status: 404 });

						const response = result || defaultResponse;

						const newResponse = await hooks.invoke(AppEvents.OnResponse, [
							stored.expose(),
							response,
						]);
						return newResponse || response;
					});

					await stored.cradle.hooks.invoke(AppEvents.OnExitContext, [
						stored.expose(),
					]);

					if (error) {
						stored.cradle.logger.error(error, `Error: ${error.message}`);
						if (error instanceof HttpException) {
							return resolve(error.toResponse());
						}
						resolve(new HttpException(500, error.message, error).toResponse());
					} else {
						resolve(response);
					}
				},
			);
		});
	}

	useContext<T extends Record<string, unknown>>(
		getContext: (ctx: _RequestContext) => T,
	) {
		this.#customContext = getContext;
		return this;
	}

	logger<
		Logger extends AbstractLogger,
		Adapter extends Class<LoggerAdapter<Logger>>,
	>(logger: Adapter, options?: ConstructorParameters<Adapter>[0]) {
		this.#logger = new logger(options);
		return this;
	}

	use<
		Module extends VermiModule<any>,
		Config extends Module["config"] = Module["config"],
	>(module: Class<Module>, options: Config): this;
	use<
		Module extends VermiModule<any>,
		Config extends Module["config"] = Module["config"],
	>([module, options]: [Class<Module>, Config]): this;
	use<
		Module extends VermiModule<any>,
		Config extends Module["config"] = Module["config"],
	>(module: Class<Module> | [Class<Module>, Config], options?: Config) {
		const [mod, config] = Array.isArray(module) ? module : [module, options];

		const useModule = (module: Class<VermiModule<any>>, options: any) => {
			// if the module depends on other modules, we need to apply them first
			const submodules = submoduleStore.apply(module).get();
			if (submodules.length) {
				for (const { module, options } of submodules) {
					useModule(module, options);
				}
			}

			const current = this.#options.modules.get(module.name)?.config;
			this.#options.modules.set(module.name, {
				module,
				config: current ? deepMerge(current, options) : options,
			});
		};

		useModule(mod, config);

		return this;
	}

	async start(onStarted: (context: AppContext, server: Server) => void) {
		this.#context.runInContext(this.#container, async (container) => {
			this.#registerServices();
			this.#initModules(container.expose());

			const { hooks } = container.cradle;

			await hooks.invoke(AppEvents.OnInit, [container.expose()]);

			const { configuration, logger } = container.cradle;

			const server = Bun.serve({
				...configuration.bunOptions,
				fetch: this.#runInRequestContext.bind(this, container),
			});

			await hooks.invoke(AppEvents.OnStarted, [container.expose(), server]);

			process.on("SIGINT", async () => {
				logger.info("Shutting down server...");
				await hooks.invoke(AppEvents.OnExit, [container.expose(), server]);

				this.#container.dispose();

				server.stop();
				setTimeout(() => {
					process.exit();
				}, 500);
			});

			onStarted(container.expose(), server);
		});
	}
}
