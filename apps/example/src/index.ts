import {
	type LogLevel,
	type LoggerAdapter,
	Vermi,
	provider,
} from "@vermi/core";
import { ws } from "@vermi/ws";
import { Redis } from "ioredis";
import { TestSocket } from "./sockets/TestSocket";

/*

new Vermi()
	.use(DDDModule, {
		mount: "/api",
		domain: await import("@domain/users"), // inject user domain { entities, services, controllers }
		controllers: await import("@app/users/controllers"), // inject user controllers, only if not provided by domain
		repository: MikroOrmRepository,
	})
*/

if (import.meta.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

new Vermi({ log: { level: import.meta.env.LOG_LEVEL as LogLevel } })
	// .use(env(DotenvAdapter, { path: ".env" })) // dotenv
	// .use(env(KeyVaultAdapter, { keyVault: "https://keyvault.vault.azure.net" })) // Azure Key Vault
	// .use(env(SecretsManagerAdapter, { secretId: "my-secret" })) // AWS Secrets Manager
	// .use(env(InfisicalAdapter, new InfisicalSdk())) // Infisical
	.use(provider("redis_cache", Redis))
	// .use(cache({ adapter: { class: RedisAdapter, provider: "redis_cache" } }))
	// .use(
	// 	router("/api", [UserController], {
	// 		casing: { internal: "camel", interfaces: "snake" },
	// 	}),
	// )
	.use(ws({ namespace: "/test" }, [TestSocket]))
	// .use(events([], { group: "/test", adapter: { class } }))
	// .use(
	// 	events([], {
	// 		group: "bullmq:test",
	// 		adapter: useBullMQConsumer("bullmq:test", { provider: "redis_cache" }),
	// 	}),
	// )
	// .use(
	// 	docs("/docs/openapi", {
	// 		specs: {},
	// 		type: "openapi",
	// 		routes: ["/api"],
	// 		casing: "snake",
	// 	}),
	// )
	// .use(docs("/docs/asyncapi", { specs: {}, type: "asyncapi", casing: "snake" }))
	// .use(AppModule, {})
	// .use(ws({ path: "/ws", eventStores: [TestSocket, ChannelSocket] }))
	// .use(
	// 	remix({
	// 		build: import.meta.resolve("@vermi/apidocs-ui/server"),
	// 		assets: import.meta.resolve("@vermi/apidocs-ui/client"),
	// 	}),
	// )
	// .use(statics("public", {}))
	.start((context, { port }) => {
		context
			.resolve<LoggerAdapter<any>>("logger")
			?.info(`Server started at ${port}`);
	});
