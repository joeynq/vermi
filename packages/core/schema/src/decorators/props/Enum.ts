import {
	type NumberOptions,
	type StringOptions,
	type TEnumKey,
	Type,
} from "@sinclair/typebox";
import { propsStore } from "../../stores";
import { getEnumValues } from "../../utils";

export function NumberEnum<T extends Record<TEnumKey, number>>(
	item: T,
	options?: NumberOptions & { nullable?: boolean },
) {
	return (target: any, propertyKey: string) => {
		const maximum = Math.max(...Object.values(item));
		const minimum = Math.min(...Object.values(item));
		let schema = getEnumValues("number", item, {
			...options,
			maximum,
			minimum,
		});

		if (options?.nullable) {
			schema = Type.Optional(schema);
		}

		propsStore.apply(target.constructor).addProperty(propertyKey, schema);
	};
}

export function StringEnum<T extends Record<TEnumKey, string>>(
	item: T,
	options?: StringOptions & { nullable?: boolean },
) {
	return (target: any, propertyKey: string) => {
		const maxLength = Math.max(...Object.values(item).map((v) => v.length));
		const minLength = Math.min(...Object.values(item).map((v) => v.length));
		let schema = getEnumValues("string", item, {
			...options,
			maxLength,
			minLength,
		});

		if (options?.nullable) {
			schema = Type.Optional(schema);
		}

		propsStore.apply(target.constructor).addProperty(propertyKey, schema);
	};
}
