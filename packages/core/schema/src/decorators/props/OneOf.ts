import { type TSchema, Type } from "@sinclair/typebox";
import { propsStore } from "../../stores";

export const OneOf = (items: TSchema[]) => {
	return (target: any, propertyKey: string) => {
		propsStore
			.apply(target.constructor)
			.addProperty(propertyKey, Type.Any({ oneOf: items }));
	};
};
