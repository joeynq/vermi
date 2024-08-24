import {
	Logger,
	type LoggerAdapter,
	Middleware,
	type RequestContext,
	Use,
	asValue,
	useDecorators,
} from "@vermi/core";
import { Guard, Matched, Unauthorized, routeStore } from "@vermi/router";
import { extendedCamelCase } from "@vermi/utils";
import type { JWTVerifyResult } from "jose";

@Middleware()
class AuthorizedMiddleware {
	@Logger() logger!: LoggerAdapter;

	isEnabled(ctx: RequestContext) {
		return !!ctx.resolve(extendedCamelCase("AuthModule"));
	}

	@Matched()
	async onGuard(ctx: RequestContext) {
		if (!this.isEnabled(ctx)) {
			return;
		}
		const route = ctx.store.route;
		if (!route.security) {
			throw new Error("Security scheme is not configured for this route");
		}
		const currentScheme = Array.from(route.security.keys())[0];

		const strategy = ctx.store.authStrategies[currentScheme];
		if (!strategy) {
			throw new Error(`No strategy found for scheme ${currentScheme}`);
		}

		await strategy.useContext(ctx);
	}

	@Guard()
	public async authorize(ctx: RequestContext) {
		if (!this.isEnabled(ctx)) {
			return;
		}
		const verifyToken =
			ctx.resolve<<T>() => Promise<JWTVerifyResult<T>>>("verifyToken");

		// biome-ignore lint/correctness/noUnsafeOptionalChaining: <explanation>
		const { payload } = await verifyToken?.();

		if (!payload?.sub) {
			this.logger.error("Unauthorized request");
			throw new Unauthorized("Unauthorized request");
		}

		ctx.register("userId", asValue(payload.sub));
	}
}

export const Authorized = (scheme: string, scopes: string[] = []) => {
	return useDecorators(
		Use(AuthorizedMiddleware),
		(target: any, propertyKey) => {
			const store = routeStore.apply(target.constructor);
			store.updateRoute(propertyKey, (current) => {
				if (!current.metadata.security) {
					current.metadata.security = new Map();
				}
				current.metadata.security.set(scheme, scopes);

				return current;
			});
		},
	);
};
