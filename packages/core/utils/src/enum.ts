type StringValues<T> = {
	[K in keyof T]: T[K] extends string ? T[K] : never;
}[keyof T];

type NumberValues<T> = {
	[K in keyof T]: T[K] extends number ? T[K] : never;
}[keyof T];

export type EnumValues<T, V extends string | number = string> = V extends string
	? `${StringValues<T>}`
	: NumberValues<T>;

export function getKeyByValue<
	TEnumKey extends string,
	TEnumVal extends string | number,
>(myEnum: { [key in TEnumKey]: TEnumVal }, enumValue: TEnumVal): string {
	const keys = (Object.keys(myEnum) as TEnumKey[]).filter(
		(x) => myEnum[x] === enumValue,
	);
	return keys.length > 0 ? keys[0] : "";
}

export function getEnumValues<TEnum extends Record<string, string | number>>(
	myEnum: TEnum,
): string[] {
	return Object.values(myEnum).filter((s) => typeof s === "string") as string[];
}
