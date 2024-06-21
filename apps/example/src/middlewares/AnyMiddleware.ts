import {
	type LoggerAdapter,
	Middleware,
	type RequestContext,
} from "@vermi/core";
import { After, Before } from "@vermi/router";

@Middleware()
export class AnyMiddleware {
	constructor(private logger: LoggerAdapter) {}

	@Before()
	public mwBefore(ctx: RequestContext) {
		this.logger.info("Before");
	}

	@After()
	public mwAfter(ctx: RequestContext) {
		this.logger.info("After");
	}
}
