import { cache } from "@vermi/cache";
import { RedisAdapter } from "@vermi/cache/redis";
import { Module, UseModule, VermiModule } from "@vermi/core";
import { redis } from "@vermi/redis";
import { router } from "@vermi/router";
import { UserController } from "./controllers";

// const authConfig = {
// 	issuer: "https://example.com",
// };

@Module()
@UseModule(
	router("/api", [UserController], {
		casing: { internal: "camel", interfaces: "snake" },
	}),
)
// FIXME: recheck securityScheme value on OpenAPI spec
// @UseModule(
// 	auth(
// 		BearerAuth,
// 		{ options: authConfig, cache: "redis.default" },
// 		"bearerAuth",
// 	),
// )
@UseModule(redis({}, "default"))
@UseModule(cache(RedisAdapter, { connection: "redis.default" }))
export class AppModule extends VermiModule<{}> {}
