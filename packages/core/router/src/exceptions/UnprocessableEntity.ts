import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class UnprocessableEntity extends RouterException {
	code = "router:unprocessable_entity";

	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.UnprocessableEntity, message, cause);
	}
}
