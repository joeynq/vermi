import {
	AppHook,
	Config,
	Module,
	type RequestContext,
	VermiModule,
} from "@vermi/core";

export type CorsConfig = {
	origin?: string[];
	methods?: string[];
	allowedHeaders?: string[];
	exposedHeaders?: string[];
	credentials?: boolean;
	maxAge?: number;
	preflightContinue?: boolean;
	optionsSuccessStatus?: number;
};

@Module()
export class CorsModule extends VermiModule<CorsConfig> {
	@Config() public config!: CorsConfig;

	@AppHook("app:response")
	async corsHook(_: RequestContext, response: Response) {
		const {
			origin,
			methods,
			allowedHeaders,
			exposedHeaders,
			credentials,
			maxAge,
			preflightContinue,
			optionsSuccessStatus,
		} = this.config;

		if (origin) {
			response.headers.set("Access-Control-Allow-Origin", origin.join(", "));
		}

		if (methods) {
			response.headers.set("Access-Control-Allow-Methods", methods.join(", "));
		}

		if (allowedHeaders) {
			response.headers.set(
				"Access-Control-Allow-Headers",
				allowedHeaders.join(", "),
			);
		}

		if (exposedHeaders) {
			response.headers.set(
				"Access-Control-Expose-Headers",
				exposedHeaders.join(", "),
			);
		}

		if (credentials) {
			response.headers.set("Access-Control-Allow-Credentials", "true");
		}

		if (maxAge) {
			response.headers.set("Access-Control-Max-Age", maxAge.toString());
		}

		if (preflightContinue) {
			response.headers.set("Access-Control-Continue", "true");
		}

		if (optionsSuccessStatus) {
			response.headers.set(
				"Access-Control-Options-Success",
				optionsSuccessStatus.toString(),
			);
		}

		return response;
	}
}
