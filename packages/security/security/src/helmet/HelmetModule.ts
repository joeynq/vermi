import {
	AppHook,
	Config,
	Module,
	type RequestContext,
	VermiModule,
} from "@vermi/core";

export type HelmetOptions = {
	contentSecurityPolicy?: boolean | Record<string, any>;
	dnsPrefetchControl?: boolean | Record<string, any>;
	expectCt?: boolean | Record<string, any>;
	frameguard?: boolean | Record<string, any>;
	hidePoweredBy?: boolean | Record<string, any>;
	hsts?: boolean | Record<string, any>;
	ieNoOpen?: boolean | Record<string, any>;
	noSniff?: boolean | Record<string, any>;
	permittedCrossDomainPolicies?: boolean | Record<string, any>;
	referrerPolicy?: boolean | Record<string, any>;
	xssFilter?: boolean | Record<string, any>;
};

@Module()
export class HelmetModule extends VermiModule<HelmetOptions> {
	@Config() public config!: HelmetOptions;

	@AppHook("app:response")
	async helmetHook(_: RequestContext, response: Response) {
		const {
			contentSecurityPolicy,
			dnsPrefetchControl,
			expectCt,
			frameguard,
			hidePoweredBy,
			hsts,
			ieNoOpen,
			noSniff,
			permittedCrossDomainPolicies,
			referrerPolicy,
			xssFilter,
		} = this.config;

		if (contentSecurityPolicy) {
			response.headers.set("Content-Security-Policy", "default-src 'self';");
		}

		if (dnsPrefetchControl) {
			response.headers.set("X-DNS-Prefetch-Control", "off");
		}

		if (expectCt) {
			response.headers.set("Expect-CT", "max-age=0");
		}

		if (frameguard) {
			response.headers.set("X-Frame-Options", "SAMEORIGIN");
		}

		if (hidePoweredBy) {
			response.headers.set("X-Powered-By", "Vermi");
		}

		if (hsts) {
			response.headers.set(
				"Strict-Transport-Security",
				"max-age=15552000; includeSubDomains",
			);
		}

		if (ieNoOpen) {
			response.headers.set("X-Download-Options", "noopen");
		}

		if (noSniff) {
			response.headers.set("X-Content-Type-Options", "nosniff");
		}

		if (permittedCrossDomainPolicies) {
			response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
		}

		if (referrerPolicy) {
			response.headers.set("Referrer-Policy", "no-referrer");
		}

		if (xssFilter) {
			response.headers.set("X-XSS-Protection", "1; mode=block");
		}

		return response;
	}
}
