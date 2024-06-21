import { docs } from "@vermi/apidocs";
import {
	type LogLevel,
	type LogOptions,
	type LoggerAdapter,
	Vermi,
} from "@vermi/core";
import { remix } from "@vermi/remix";
import { statics } from "@vermi/static";
import { ChannelSocket, ws } from "@vermi/ws";
import { AppModule } from "./AppModule";
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

const logOptions: LogOptions = {
	level: import.meta.env.LOG_LEVEL as LogLevel,
	options: {
		formatDate: (date) => {
			date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
			return date.toISOString().split("T")[1].split("Z")[0];
		},
	},
};

new Vermi({ log: logOptions })
	.use(
		docs("/docs/openapi", {
			specs: {},
			type: "openapi",
			routes: ["/api"],
			casing: "snake",
		}),
	)
	.use(docs("/docs/asyncapi", { specs: {}, type: "asyncapi", casing: "snake" }))
	.use(AppModule, {})
	.use(ws({ path: "/ws", eventStores: [TestSocket, ChannelSocket] }))
	.use(
		remix({
			build: import.meta.resolve("@vermi/apidocs-ui/server"),
			assets: import.meta.resolve("@vermi/apidocs-ui/client"),
		}),
	)
	.use(statics("public", {}))
	.start((context, { port }) => {
		context.resolve<LoggerAdapter>("logger")?.info(`Server started at ${port}`);
	});
