import { type AnyClass, type AnyFunction, deepMerge, uuid } from "@vermi/utils";
import { InjectionMode, Lifetime, asValue, createContainer } from "awilix";
import type { Server } from "bun";
import { type AppEventMap, AppEvents } from "./events";
import { HttpException } from "./exceptions";
import type {
	AbstractLogger,
	AppContext,
	AppOptions,
	EnhancedContainer,
	LoggerAdapter,
	ModuleConfig,
	UseModule,
	VermiModule,
	_AppContext,
	_RequestContext,
} from "./interfaces";
import {
	Configuration,
	ConsoleLogger,
	ContextService,
	Hooks,
} from "./services";
import { HookMetadataKey } from "./symbols";
import { enhance } from "./utils";

export class Vermi {
	#logger: LoggerAdapter;
	#config: Configuration;
	#hooks = new Hooks<typeof AppEvents, AppEventMap>();
	#context = new ContextService();
	#container = enhance(
		createContainer<_AppContext>({
			injectionMode: InjectionMode.CLASSIC,
			strict: true,
		}),
	);

	#customContext?: (ctx: _RequestContext) => Record<string, unknown>;

	constructor(options?: Partial<AppOptions>) {
		this.#config = new Configuration({
			...options,
			modules: options?.modules || [],
		});
		this.#logger = new ConsoleLogger({
			level: this.#config.options.log?.level ?? "info",
			noColor: this.#config.options.log?.noColor,
			stackTrace: this.#config.options.log?.stackTrace,
		});
	}

	#registerServices() {
		this.#container.register({
			_logger: asValue(this.#logger),
			env: asValue(this.#config.options.env || {}),
			app: asValue(this),
			logger: {
				resolve: (c) => {
					const _logger = c.resolve<LoggerAdapter>("_logger");

					if (c.hasRegistration("requestId")) {
						return _logger.useContext({
							requestId: c.resolve("requestId"),
							serverUrl: c.resolve("serverUrl"),
							userIp: c.resolve("userIp"),
							userAgent: c.resolve("userAgent"),
						});
					}
					return _logger;
				},
				lifetime: Lifetime.SCOPED,
			},
			configuration: asValue(this.#config),
			hooks: asValue(this.#hooks),
		});
	}

	#initModules() {
		const moduleConfigs = this.#config.options.modules;
		for (const { moduleInstance } of moduleConfigs) {
			this.#hooks.registerFromMetadata(moduleInstance);
		}
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
					try {
						stored.register({
							requestId: asValue(request.headers.get("x-request-id") ?? uuid()),
							request: asValue(request),
							serverUrl: asValue(server.url.toJSON()),
							userIp: asValue(server.requestIP(request) || undefined),
							userAgent: asValue(
								request.headers.get("user-agent") ?? undefined,
							),
						});

						for (const [key, value] of Object.entries(
							this.#customContext?.(stored.cradle) || {},
						)) {
							stored.registerValue(key, value);
						}

						await this.#hooks.invoke(AppEvents.OnEnterContext, [
							stored.expose(),
						]);

						const result = await this.#hooks.invoke(
							AppEvents.OnRequest,
							[stored.expose()],
							{
								breakOn: "result",
							},
						);

						const response = result || new Response("OK", { status: 200 });

						await this.#hooks.invoke(AppEvents.OnResponse, [
							stored.expose(),
							response,
						]);
						resolve(response);
					} catch (error) {
						if (error instanceof HttpException) {
							return resolve(error.toResponse());
						}
						resolve(
							new HttpException(
								500,
								(error as Error).message,
								error as Error,
							).toResponse(),
						);
					} finally {
						await this.#hooks.invoke(AppEvents.OnExitContext, [
							stored.expose(),
						]);
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
		Adapter extends AnyClass<LoggerAdapter<Logger>>,
	>(logger: Adapter, options?: ConstructorParameters<Adapter>[0]) {
		this.#logger = new logger({
			...this.#config.options.log,
			...options,
		});
		return this;
	}

	use<M extends AnyClass<VermiModule>>({ module, args }: UseModule<M>): this {
		const config: ModuleConfig = {
			moduleInstance: new module(...args),
			hooks: {},
		};

		const hookMetadata = Reflect.getMetadata(
			HookMetadataKey,
			module.prototype,
		) as Record<string, (string | symbol)[]> | undefined;

		if (hookMetadata) {
			for (const [event, methods] of Object.entries(hookMetadata)) {
				for (const m of methods) {
					const instance = config.moduleInstance;
					// @ts-expect-error
					const handler = instance[m.method].bind(instance) as AnyFunction;
					if (handler) {
						config.hooks = deepMerge(config.hooks, {
							[event]: [handler],
						});
					}
				}
			}
		}

		this.#config.setModuleConfig(config);

		return this;
	}

	async start(onStarted: (context: AppContext, server: Server) => void) {
		this.#context.runInContext(this.#container, async (container) => {
			this.#registerServices();
			this.#initModules();
			await this.#hooks.invoke(AppEvents.OnInit, [container.expose()]);

			const server = Bun.serve({
				...this.#config.bunOptions,
				fetch: this.#runInRequestContext.bind(this, container),
			});
			await this.#hooks.invoke(AppEvents.OnStarted, [
				container.expose(),
				server,
			]);

			process.on("SIGINT", async () => {
				this.#logger.info("Shutting down server...");
				await this.#hooks.invoke(AppEvents.OnExit, [
					container.expose(),
					server,
				]);

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