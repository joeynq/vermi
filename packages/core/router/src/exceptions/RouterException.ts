import { type TObject, Type } from "@sinclair/typebox";
import { ValueErrorType } from "@sinclair/typebox/errors";
import { HttpException } from "@vermi/core";
import { getEnumValues, snakeCase } from "@vermi/utils";

export interface RouterExceptionStatic {
	new (...args: any[]): RouterException;
	toSchema(): TObject;
}

const errors = getEnumValues(ValueErrorType).map((s) => snakeCase(s));
const maxLength = Math.max(...errors.map((s) => s.length));
const minLength = Math.min(...errors.map((s) => s.length));

export abstract class RouterException extends HttpException {
	abstract code: string;
	errors?: { type: string; path: string; message: string }[];

	toJSON() {
		return {
			...super.toJSON(),
			trace: this.stack,
			code: this.code,
			errors: this.errors,
		};
	}

	static schema = Type.Object(
		{
			status: Type.Integer({ minimum: 400, maximum: 599, format: "int32" }),
			message: Type.String({ maxLength: 1024, minLength: 1 }),
			code: Type.String({
				maxLength: 64,
				minLength: 3,
				pattern: "^[a-zA-Z0-9_:]+$",
			}),
			trace: Type.Optional(Type.String({ maxLength: 1024, minLength: 1 })),
			errors: Type.Optional(
				Type.Array(
					Type.Object(
						{
							code: Type.String({
								enum: errors,
								maxLength,
								minLength,
							}),
							path: Type.String({
								maxLength: 1024,
								minLength: 2,
								pattern: "^/[^/]+(/[^/]+)*$",
							}),
							message: Type.String({ maxLength: 1024, minLength: 1 }),
						},
						{ $id: "#/components/schemas/ExceptionError" },
					),
					{
						maxItems: 100,
						minItems: 0,
						$id: "#/components/schemas/ExceptionErrors",
					},
				),
			),
		},
		{
			$id: "#/components/schemas/Exception",
		},
	);
}
