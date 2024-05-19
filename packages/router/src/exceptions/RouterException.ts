import { type TObject, Type } from "@sinclair/typebox";
import { HttpException } from "@vermi/core";

export interface RouterExceptionStatic {
	new (...args: any[]): RouterException;
	toSchema(): TObject;
}

export abstract class RouterException extends HttpException {
	toSchema(): TObject {
		return Type.Object(
			{
				status: Type.Number({ default: this.status }),
				message: Type.String({ default: this.message }),
			},
			{
				$id: `#/components/schemas/${this.constructor.name}`,
			},
		);
	}
}
