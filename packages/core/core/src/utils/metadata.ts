import {
	type Class,
	type DeepPartial,
	deepMerge,
	extendedCamelCase,
	isClass,
	isInstance,
} from "@vermi/utils";

export const getMetadata = <T = any>(
	key: string | symbol,
	target: any,
): T | undefined => {
	return Reflect.getMetadata(key, target);
};

export const setMetadata = <T = any>(
	key: string | symbol,
	value: T,
	target: any,
): void => {
	Reflect.defineMetadata(key, value, target);
};

export const mergeMetadata = <T extends object = object>(
	key: string | symbol,
	value: DeepPartial<T>,
	target: any,
	position: "before" | "after" = "after",
): void => {
	const existing = getMetadata<T>(key, target) ?? {};
	setMetadata(
		key,
		position === "after"
			? deepMerge(existing, value)
			: deepMerge(value, existing),
		target,
	);
};

export const getTokenName = (token: string | symbol | Class<any>): string => {
	if (typeof token === "symbol") {
		return extendedCamelCase(token.description || token.toString());
	}
	if (isClass(token)) {
		return extendedCamelCase(token.name);
	}
	if (isInstance(token)) {
		return extendedCamelCase(token.constructor.name);
	}
	return extendedCamelCase(token);
};
