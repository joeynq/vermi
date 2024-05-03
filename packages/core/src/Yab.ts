import { type AnyClass, type AnyFunction, deepMerge, uuid } from "@yab/utils";
import type { Server } from "bun";
import { registerValue, resolveValue } from "./container";
import { EnvKey } from "./decorators";
import { type YabEventMap, YabEvents } from "./events";
import { HttpException } from "./exceptions";
import type {
	Context,
	LoggerAdapter,
	Module,
	ModuleConfig,
	YabOptions,
} from "./interfaces";
import {
	Configuration,
	ConsoleLogger,
	ContextService,
	Hooks,
} from "./services";
import { HookMetadataKey, LoggerKey } from "./symbols";

export interface YabUse<M extends AnyClass<Module>> {
	module: M;
	args: ConstructorParameters<M>;
}

export class Yab {
	#config: Configuration;
	#hooks = new Hooks<typeof YabEvents, YabEventMap>();
	#context = new ContextService();

	#customContext?: (ctx: Context) => Record<string, unknown>;

	get logger() {
		return resolveValue<LoggerAdapter>(LoggerKey);
	}

	constructor(options?: Partial<YabOptions>) {
		this.#config = new Configuration({
			...options,
			modules: options?.modules || [],
		});

		this.#registerServices();
	}

	#registerServices() {
		registerValue(Configuration, this.#config);
		registerValue(ContextService, this.#context);
		registerValue(LoggerKey, new ConsoleLogger("info"));
		registerValue(EnvKey, {});
		registerValue(Hooks, this.#hooks);
	}

	#registerHooksFromModule(instance: Module) {
		const hookMetadata = this.#config.getModuleConfig(instance)?.hooks;
		if (hookMetadata) {
			for (const [event, handlers] of Object.entries(hookMetadata)) {
				for (const handler of handlers) {
					this.#hooks.register(event as any, handler);
				}
			}
		}
	}

	#initModules() {
		const moduleConfigs = this.#config.options.modules;
		for (const { moduleInstance } of moduleConfigs) {
			this.#registerHooksFromModule(moduleInstance);
		}
	}

	#buildContext(request: Request, server: Server) {
		const context: Context = {
			requestId: request.headers.get("x-request-id") || uuid(),
			logger: this.logger,
			request,
			serverUrl: server.url.toString(),
			userIp: server.requestIP(request) || undefined,
			userAgent: request.headers.get("user-agent") || undefined,
		};
		return {
			...context,
			...this.#customContext?.(context),
		};
	}

	#runWithContext(initContext: Context) {
		return new Promise<Response>((resolve) => {
			this.#context.runWithContext(initContext, async () => {
				try {
					const context = this.#context.context || initContext;

					const result = await this.#hooks.invoke(
						YabEvents.OnRequest,
						[context],
						{
							breakOnResult: true,
						},
					);

					const response = result || new Response("OK", { status: 200 });

					await this.#hooks.invoke(YabEvents.OnResponse, [
						initContext,
						response,
					]);
					resolve(response);
				} catch (error) {
					if (error instanceof HttpException) {
						return resolve(error.toResponse());
					}
					resolve(
						new HttpException(500, (error as Error).message).toResponse(),
					);
				}
			});
		});
	}

	context<T extends Record<string, unknown>>(getContext: (ctx: Context) => T) {
		this.#customContext = getContext;
		return this;
	}

	use<M extends AnyClass<Module>>({ module, args }: YabUse<M>): this {
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
				for (const method of methods) {
					const instance = config.moduleInstance;
					// @ts-expect-error
					const handler = instance[method].bind(instance) as AnyFunction;
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

	async start(onStarted: (server: Server, app: Yab) => void) {
		this.#initModules();

		await this.#hooks.invoke(YabEvents.OnInit, [
			{
				container: { registerValue, resolveValue },
				app: this,
			},
		]);

		const self = this;

		const server = Bun.serve({
			...this.#config.bunOptions,
			async fetch(request, server): Promise<Response> {
				const initContext = self.#buildContext(request, server);
				return self.#runWithContext(initContext);
			},
		});
		await this.#hooks.invoke(YabEvents.OnStarted, [server, this]);

		for (const eventType of [
			"SIGINT",
			"SIGUSR1",
			"SIGUSR2",
			"uncaughtException",
			"SIGTERM",
		]) {
			process.on(eventType, async (exitCode) => {
				this.logger.info("Shutting down server...");
				await self.#hooks.invoke(YabEvents.OnExit, [server, this]);
				server.stop();
				setTimeout(() => {
					process.exit(exitCode);
				}, 500);
			});
		}

		onStarted(server, this);
	}
}
