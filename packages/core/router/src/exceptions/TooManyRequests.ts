import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

interface RateLimiterRes {
	limit: number;
	reset: number;
	remaining: number;
	retryAfter: number;
}

export class TooManyRequests extends RouterException {
	code = "router:too_many_requests";

	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.TooManyRequests, message, cause);
	}
}
