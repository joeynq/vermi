import { type ArrayOptions, type TSchema, Type } from "@sinclair/typebox";
import { limitSettings } from "../../settings";
import { propsStore } from "../../stores";

export const Array = <T extends TSchema>(
	options?: ArrayOptions & { nullable?: boolean },
) => {
	const { nullable, ...rest } = options || {};
	return {
		Of(type: () => T, propOpts?: T) {
			return (target: any, key: string) => {
				const single = type();

				if (propOpts) {
					Object.assign(single, propOpts);
				}

				let typeArr = Type.Array(single, {
					maxItems: limitSettings.arrayMaxItems,
					minItems: 0,
					...rest,
				});
				if (nullable) {
					typeArr = Type.Optional(typeArr);
				}

				propsStore.apply(target.constructor).addProperty(key, typeArr);
			};
		},

		OneOf(types: (() => T)[]) {
			return (target: any, key: string) => {
				const oneOf = types.map((type) => type());
				let typeArr = Type.Array(Type.Union(oneOf), {
					maxItems: limitSettings.arrayMaxItems,
					minItems: 0,
					...rest,
				});
				if (nullable) {
					typeArr = Type.Optional(typeArr);
				}

				propsStore.apply(target.constructor).addProperty(key, typeArr);
			};
		},
	};
};
