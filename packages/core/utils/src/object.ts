import { deepmerge } from "deepmerge-ts";
import type {
	Class,
	Dictionary,
	Path,
	PathValue,
	Primitive,
	WithoutUndefined,
} from "./internal/object";
import { isUndefined } from "./nullish";

export const isObject = (value: unknown): value is object => {
	return value !== null && typeof value === "object";
};

export const isPlainObject = (value: unknown): value is object => {
	return isObject(value) && !isPrimitive(value);
};

export const isClass = <T = any>(value: any): value is Class<T> => {
	return typeof value === "function" && /^\s*class\s+/.test(value.toString());
};

export const isInstance = <T extends abstract new (...args: any) => any>(
	value: any,
): value is InstanceType<T> => {
	return (
		typeof value === "object" && !isPlainObject(value) && !isClass<T>(value)
	);
};

export const isPrimitive = (value: any): value is Primitive => {
	return value == null || /^[sbn]/.test(typeof value);
};

export const deepMerge = deepmerge;

export const clone = <T extends object>(obj: T, newPropertyValues: any): T => {
	const clone = new (obj.constructor as new () => T)();

	const nestedClones = Object.getOwnPropertyNames(clone).reduce(
		(partial, propertyName) => {
			const property = Object.getOwnPropertyDescriptor(clone, propertyName);
			const isNotProvided = isUndefined(
				Object.getOwnPropertyDescriptor(newPropertyValues, propertyName),
			);

			if (isNotProvided) {
				partial[propertyName as keyof T] = property?.value;
			}

			return partial;
		},
		{} as Partial<T>,
	);

	return Object.assign(clone, this, nestedClones, newPropertyValues);
};

export const omitUndefined = <T extends object>(
	obj: T,
): WithoutUndefined<T> => {
	const result = {} as Partial<T>;

	for (const key in obj) {
		if (!isUndefined(obj[key])) {
			result[key] = obj[key];
		}
	}

	return result as WithoutUndefined<T>;
};

export const flatten = <T extends Dictionary>(obj: unknown): T => {
	const flattened = {} as T;

	if (!obj || typeof obj !== "object") {
		return flattened;
	}

	const stack: [string, unknown][] = [["", obj]];
	while (stack.length > 0) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const [prefix, value] = stack.pop()!;
		if (value == null) {
			// @ts-expect-error
			flattened[prefix] = value;
		} else if (typeof value !== "object") {
			// @ts-expect-error
			flattened[prefix] = value;
		} else if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				stack.push([`${prefix}.${i}`, value[i]]);
			}
		} else {
			for (const key in value) {
				// @ts-expect-error
				stack.push([`${prefix}.${key}`, value[key]]);
			}
		}
	}

	return flattened;
};

export const toPlainObject = <T extends object>(
	obj: InstanceType<Class<T>>,
): T => {
	return Object.assign({}, obj);
};

export function getVal<T extends object, P extends Path<T>>(
	obj: T,
	key: P,
): PathValue<T, P> | undefined;
export function getVal<
	T extends object,
	P extends Path<T>,
	D = PathValue<T, P>,
>(obj: T, key: P, defaultValue: D): PathValue<T, P> | D;
export function getVal<
	T extends object,
	P extends Path<T>,
	D = PathValue<T, P> | undefined,
>(
	obj: T,
	key: P,
	defaultValue?: D | undefined,
): PathValue<T, P> | D | undefined {
	const keys = key.split(".");
	const val = keys.reduce<PathValue<T, P>>(
		(acc, key) => (acc as never)?.[key as keyof object],
		obj as never,
	);
	return val ?? defaultValue;
}

export const setVal = <
	T extends object,
	P extends Path<T>,
	V extends PathValue<T, P>,
>(
	obj: T,
	key: P,
	value: V,
): T => {
	const keys = key.split(".");
	const lastKey = keys.pop() as string;
	const target = keys.reduce<object>(
		(acc, key) => (acc as never)?.[key as keyof object],
		obj as never,
	);
	target[lastKey as keyof object] = value;
	return obj;
};

// change case of object keys, support nested objects
export const changeObjectCase = <T extends object>(
	obj: T,
	fn: (key: string) => string,
) => {
	const input = toPlainObject(obj as any);
	const result = {} as any;

	for (const key in input) {
		const value = input[key as keyof T];
		if (Array.isArray(value)) {
			result[fn(key)] = value.map((item) =>
				isPlainObject(item) ? changeObjectCase(item, fn) : item,
			);
		} else if (isPlainObject(value)) {
			result[fn(key)] = changeObjectCase(value, fn);
		} else {
			result[fn(key)] = value;
		}
	}

	return result;
};

export const mapToRecords = <
	K extends string | number | symbol,
	T extends object,
>(
	map: Map<K, T>,
): Record<K, T> => {
	const record = {} as Record<K, T>;

	for (const [key, value] of map) {
		record[key] = value;
	}

	return record;
};

export { stringify, configure as stringifyConfig } from "safe-stable-stringify";

export * from "./internal/object";
