import { Type } from "@sinclair/typebox";
import { guessType, isPrimitive } from "@vermi/schema";
import { type Class, pascalCase } from "@vermi/utils";
import { eventStore } from "../stores";

export type PayloadOptions = {
	nullable?: boolean;
	name?: string;
	type?: Class<any>;
	pipes?: Array<Class<any>>;
};

export function Payload({ name, nullable, type, pipes }: PayloadOptions = {}) {
	return (
		target: any,
		propertyKey: string | symbol,
		parameterIndex: number,
	) => {
		const typeClass =
			type ||
			Reflect.getMetadata("design:paramtypes", target, propertyKey)[
				parameterIndex
			];

		const schema = guessType(typeClass) || Type.Any();

		if (!isPrimitive(typeClass) && !schema.$id) {
			schema.$id = `#/components/schemas/${pascalCase(name ?? typeClass.name)}`;
		}

		eventStore
			.apply(target.constructor)
			.addArg(propertyKey, parameterIndex, schema, {
				required: !nullable,
				pipes,
			});
	};
}
