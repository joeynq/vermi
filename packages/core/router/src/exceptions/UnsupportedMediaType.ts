import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class UnsupportedMediaType extends RouterException {
	code = "router:unprocessable_entity";

	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.UnsupportedMediaType, message, cause);
	}
}
