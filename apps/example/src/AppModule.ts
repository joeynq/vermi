import { Module, VermiModule } from "@vermi/core";
// import { redis } from "@vermi/redis";

// const authConfig = {
// 	issuer: "https://example.com",
// };

@Module()
// @UseProvider("redis.default", new Redis())
// @UseProvider("sqlite.default", new Database(":memory:"))
// @UseModule(
// 	router("/api", [UserController], {
// 		casing: { internal: "camel", interfaces: "snake" },
// 	}),
// )
// // FIXME: recheck securityScheme value on OpenAPI spec
// // @UseModule(
// // 	auth(
// // 		BearerAuth,
// // 		{ options: authConfig, cache: "redis.default" },
// // 		"bearerAuth",
// // 	),
// // )
// // @UseModule(redis({}, "default"))
// @UseModule(cache(RedisAdapter, { connection: "redis.default" }))
export class AppModule extends VermiModule<{}> {}
