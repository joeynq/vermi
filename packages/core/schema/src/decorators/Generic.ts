import {
	type ArrayOptions,
	type ObjectOptions,
	type TSchema,
	Type,
} from "@sinclair/typebox";
import { useDecorators } from "@vermi/core";
import { limitSettings } from "../settings";
import { type PropsStoreDto, propsStore } from "../stores";
import { Model, type ModelOptions } from "./Model";
import { Prop } from "./props";

export const Generic = (
	schemaOptions?: ObjectOptions,
	options?: ModelOptions,
) => {
	return useDecorators(
		Model(schemaOptions, { ...options, abstract: true }),
		(target: any) => {
			const props = propsStore.apply(target).get();
			const genericKeys: Array<{
				key: string;
				isArray: boolean;
				nullable?: boolean;
			}> = Reflect.getMetadata("generic:keys", target) || [];

			const genericBuilder = <T extends TSchema>(
				T: T,
				name: string,
				arrayOptions?: ArrayOptions,
			) => {
				const propsWithGenerics = Object.entries(props).reduce(
					(acc, [key, value]) => {
						const genericKey = genericKeys.find((k) => k.key === key);

						if (genericKey) {
							const { isArray, nullable } = genericKey;
							const generic = isArray
								? Type.Array(T, {
										maxItems: limitSettings.arrayMaxItems,
										minItems: 0,
										...arrayOptions,
									})
								: T;

							acc[key] = nullable ? Type.Optional(generic) : generic;
						} else {
							acc[key] = value;
						}
						return acc;
					},
					{} as PropsStoreDto,
				);
				return Type.Object(propsWithGenerics, {
					...options,
					$id: `#/components/schemas/${name}`,
				});
			};

			Reflect.defineMetadata("generic:builder", genericBuilder, target);
		},
	);
};

export const Of = ({ nullable }: { nullable?: boolean } = {}) => {
	return useDecorators<PropertyDecorator>(
		Prop(Type.Any()),
		(target: any, key: string | symbol) => {
			const type = Reflect.getMetadata("design:type", target, key);

			const isArray = type === Array;

			const genericKeys: Array<{
				key: string;
				isArray: boolean;
				nullable?: boolean;
			}> = Reflect.getMetadata("generic:keys", target) || [];

			if (genericKeys.some((k) => k.key === key)) {
				return;
			}

			Reflect.defineMetadata(
				"generic:keys",
				[...genericKeys, { key, isArray, nullable }],
				target.constructor,
			);
		},
	);
};

/*

@Generics("T")
class Pagination<T> {
  @OfArray("T")
  data: T[];

  @Of("T")
  item: T;
}

function Generic<M, T>(model: M, type: T) {
  return Type.Object(type).data(model)
}

function Pagination(model: User) {
  return Type.Object(User)
}

*/
