import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class PayloadTooLarge extends RouterException {
	code = "router:payload_too_large";

	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.PayloadTooLarge, message, cause);
	}
}
