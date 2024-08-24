import { type Class, ensure, pathIs, tryRun, uuid } from "@vermi/utils";
import {
	InjectionMode,
	Lifetime,
	asClass,
	asValue,
	createContainer,
} from "awilix";
import { type Server } from "bun";
import { Module } from "./decorators";
import { type AppEventMap, AppEvents } from "./events";
import { HttpException } from "./exceptions";
import {
	type AppContext,
	type AppOptions,
	type EnhancedContainer,
	type LoggerAdapter,
	type UseParameters,
	type VermiModuleMethods,
	type _AppContext,
	type _RequestContext,
} from "./interfaces";
import { LoggerToken } from "./modules";
import {
	Configuration,
	ConsoleLogger,
	ContextService,
	Hooks,
} from "./services";
import { submoduleStore } from "./store";
import { enhance, registerHooks, registerProviders } from "./utils";

@Module({ deps: [Configuration, Hooks] })
class AppModule {}

export class Vermi {
	#container = enhance(
		createContainer<_AppContext>({
			injectionMode: InjectionMode.CLASSIC,
			strict: true,
		}),
	);

	#options: AppOptions;

	#context = new ContextService();

	get hooks() {
		const hooks =
			this.#container.resolve<Hooks<typeof AppEvents, AppEventMap>>("hooks");
		ensure(hooks);
		return hooks;
	}

	constructor(options?: Partial<AppOptions>) {
		this.#options = {
			modules: new Map(),
			...options,
		};
	}

	#registerServices() {
		this.#container.register({
			appConfig: asValue(this.#options),
			env: asValue(this.#options?.env || {}),
			app: asValue(this),
			contextService: asValue(this.#context),
			[LoggerToken]: asClass(ConsoleLogger),
			logger: {
				resolve: (c) => {
					const _logger = c.resolve<LoggerAdapter<any>>(LoggerToken);

					if (c.hasRegistration("traceId")) {
						return _logger.useContext({
							traceId: c.resolve("traceId"),
						});
					}
					return _logger;
				},
				lifetime: Lifetime.SCOPED,
			},
		});
	}

	#initModules(context: AppContext) {
		const modules = Array.from(this.#options.modules.values())
			// retrieve the module classes
			.flatMap((set) => {
				return Array.from(set).map(({ module }) => module);
			})
			// remove duplicates
			.filter((value, index, self) => self.indexOf(value) === index);

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

	use<Config, Module extends VermiModuleMethods<Config>>(
		opts: UseParameters<any>[] | UseParameters<Module>,
	): this {
		const useModule = <M extends VermiModuleMethods<any>>(
			module: Class<M>,
			conf: M["config"][number],
		) => {
			const submodules = submoduleStore.apply(module).get();
			if (submodules.length) {
				for (const { module, options } of submodules) {
					useModule(module, options);
				}
			}

			const current = this.#options.modules.get(module.name) || [];
			current.push({ module, config: conf, id: uuid() });

			this.#options.modules.set(module.name, current);
		};

		const options = Array.isArray(opts) ? opts : [opts];

		for (const { module, config } of options) {
			useModule(module, config);
		}

		// useModule(module, config);

		return this;
	}

	async start(onStarted: (context: AppContext, server: Server) => void) {
		this.#context.runInContext(this.#container, async (container) => {
			this.#registerServices();
			this.#initModules(container.expose());

			const hooks = container.cradle.hooks;

			await hooks.invoke(AppEvents.OnInit, [container.expose()]);

			const {
				configuration: { bunOptions },
			} = container.cradle;

			const server = Bun.serve({
				...bunOptions,
				fetch: this.#runInRequestContext.bind(this, container),
			});

			await hooks.invoke(AppEvents.OnStarted, [container.expose(), server]);

			onStarted(container.expose(), server);
		});
	}
}
