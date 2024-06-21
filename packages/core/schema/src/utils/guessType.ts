import { type TSchema, Type } from "@sinclair/typebox";
import { isClass } from "@vermi/utils";
import { SchemaKey } from "../decorators";

export const guessType = (PropType: any): TSchema | undefined => {
	switch (PropType) {
		case String:
			return Type.String();

		case Number:
			return Type.Number();

		case BigInt:
			return Type.Integer({ format: "int64" });

		case Boolean:
			return Type.Boolean();

		case undefined:
			return;

		case Object:
			return Type.Any();

		case Date:
			return Type.String({ format: "date-time" });

		case Array:
			return Type.Array(Type.Any());

		default:
	}

	if (isClass(PropType)) {
		return (PropType as any)[SchemaKey];
	}

	return Type.Any();
};

export const isPrimitive = (PropType: any) => {
	return [String, Number, BigInt, Boolean, Date].includes(PropType);
};
