import { stringify } from "@vermi/utils";
import type { HttpErrorCodes } from "../enum";

export class HttpException extends Error {
	constructor(
		public readonly status: HttpErrorCodes,
		message: string,
		cause?: Error,
	) {
		super(message, { cause });
	}

	toResponse() {
		return new Response(stringify({ error: this.toJSON() }), {
			status: this.status,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	toJSON() {
		return {
			status: this.status,
			message: this.message,
		};
	}
}
