import { Type } from "@sinclair/typebox";
import { guessType, isPrimitive } from "@vermi/schema";
import { type Class, pascalCase } from "@vermi/utils";
import { wsHandlerStore } from "../stores";

export type MessageOptions = {
	nullable?: boolean;
	name?: string;
	type?: Class<any>;
	pipes?: Array<Class<any>>;
};

export function Message({ name, nullable, type, pipes }: MessageOptions = {}) {
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

		wsHandlerStore
			.apply(target.constructor)
			.addArg(propertyKey, parameterIndex, schema, {
				required: !nullable,
				pipes,
			});
	};
}
