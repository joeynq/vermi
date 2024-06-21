import { Type } from "@sinclair/typebox";
import { guessType, isPrimitive } from "@vermi/schema";
import { type Class, pascalCase } from "@vermi/utils";
import type { ContentType } from "../interfaces";
import { routeStore } from "../stores";

export type BodyOptions = {
	name?: string;
	pipes?: Array<Class<any>>;
	type?: Class<any>;
	nullable?: boolean;
	contentType?: ContentType;
};

export const Body = ({
	type,
	pipes,
	name,
	nullable = false,
	contentType = "application/json",
}: BodyOptions = {}) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		const typeClass =
			type ||
			Reflect.getMetadata("design:paramtypes", target, propertyKey)[
				parameterIndex
			];

		const schema = guessType(typeClass) || Type.Any();

		if (isPrimitive(typeClass)) {
			schema.$id = `#/components/schemas/${pascalCase(name ?? typeClass.name)}`;
		}

		routeStore.apply(target.constructor).addArg(propertyKey, parameterIndex, {
			in: "body",
			schema,
			required: !nullable,
			index: parameterIndex,
			name: pascalCase(name ?? typeClass.name),
			pipes,
			contentType,
		});
	};
};
