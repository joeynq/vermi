import { Type } from "@sinclair/typebox";
import { guessType, isPrimitive } from "@vermi/schema";
import { type Class, pascalCase } from "@vermi/utils";
import type { Parameter } from "../interfaces";
import { routeStore } from "../stores";

export type ArgOptions = {
	nullable?: boolean;
	name?: string;
	type?: Class<any>;
	pipes?: Array<Class<any>>;
};

export const Arg = (
	from: Parameter["in"],
	{ nullable = false, name, type, pipes }: ArgOptions = {},
) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		const typeClass =
			type ||
			Reflect.getMetadata("design:paramtypes", target, propertyKey)[
				parameterIndex
			];

		const schema = guessType(typeClass) || Type.Any();

		if (!isPrimitive(typeClass) && !schema.$id) {
			schema.$id = `#/components/schemas/${pascalCase(name ?? typeClass.name)}`;
		}

		routeStore.apply(target.constructor).addArg(propertyKey, parameterIndex, {
			in: from,
			schema,
			required: !nullable,
			index: parameterIndex,
			name: pascalCase(name ?? typeClass.name),
			pipes,
		});
	};
};
