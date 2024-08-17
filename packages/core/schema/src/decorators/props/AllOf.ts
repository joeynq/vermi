import { type IntersectOptions, type TSchema, Type } from "@sinclair/typebox";
import { propsStore } from "../../stores";

export const AllOf = (
	items: TSchema[],
	options?: IntersectOptions & { nullable?: boolean },
) => {
	return (target: any, propertyKey: string) => {
		const { nullable, ...schemaOptions } = options || {};
		const schema = Type.Intersect(items, schemaOptions);

		propsStore
			.apply(target.constructor)
			.addProperty(propertyKey, nullable ? Type.Optional(schema) : schema);
	};
};
