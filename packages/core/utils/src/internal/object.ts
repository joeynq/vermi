import type { Class, Primitive } from "type-fest";

/**
 * @deprecated Use `Class` from `type-fest` instead.
 */
export type AnyClass<T = any> = Class<T>;

export type Dictionary<T = unknown> = Record<string, T>;
export type AnyFunction = (...args: any[]) => unknown;
export type AnyPromiseFunction = (...args: any[]) => Promise<unknown>;
export type MaybePromiseFunction = AnyFunction | AnyPromiseFunction;
export type MaybePromise<T> = T | Promise<T>;

export type StaticImplements<
	I extends Class<any>,
	C extends I,
> = InstanceType<C>;

export type WithoutUndefined<T extends object> = {
	[P in keyof T]: T[P] extends undefined ? never : T[P];
};

export type DeepPartial<T extends object> = {
	[P in keyof T]?: T[P] extends Class<any> | AnyFunction | Primitive
		? T[P]
		: T[P] extends object
			? DeepPartial<T[P]>
			: T[P];
};

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
	T,
>() => T extends Y ? 1 : 2
	? A
	: B;

type WritableKeys<T> = {
	[P in keyof T]-?: IfEquals<
		{ [Q in P]: T[P] },
		{ -readonly [Q in P]: T[P] },
		P,
		never
	>;
}[keyof T];

type FunctionKeys<T> = {
	[P in keyof T]: T[P] extends AnyFunction ? P : never;
}[keyof T];

export type Writable<T> = Pick<T, WritableKeys<T>>;

export type Editable<T> = Partial<Omit<Writable<T>, FunctionKeys<T>>>;

export type IsTuple<T extends ReadonlyArray<any>> = number extends T["length"]
	? false
	: true;

type TupleKeys<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;

export type IsEqual<T1, T2> = T1 extends T2
	? (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2
		? true
		: false
	: false;

type IsAny<T> = 0 extends 1 & T ? true : false;

type AnyIsEqual<T1, T2> = T1 extends T2
	? IsEqual<T1, T2> extends true
		? true
		: never
	: never;

type PathImpl<
	K extends string | number,
	V,
	TraversedTypes,
> = V extends Primitive
	? `${K}`
	: true extends AnyIsEqual<TraversedTypes, V>
		? `${K}`
		: `${K}` | `${K}.${PathInternal<V, TraversedTypes | V>}`;

type PathInternal<T, TraversedTypes = T> = T extends ReadonlyArray<infer V>
	? IsTuple<T> extends true
		? {
				[K in TupleKeys<T>]-?: PathImpl<K & string, T[K], TraversedTypes>;
			}[TupleKeys<T>]
		: PathImpl<number, V, TraversedTypes>
	: {
			[K in keyof T]-?: PathImpl<K & string, T[K], TraversedTypes>;
		}[keyof T];

export type Path<T> = T extends any ? PathInternal<T> : never;

type ArrayPathImpl<
	K extends string | number,
	V,
	TraversedTypes,
> = V extends Primitive
	? IsAny<V> extends true
		? string
		: never
	: V extends ReadonlyArray<infer U>
		? U extends Primitive
			? IsAny<V> extends true
				? string
				: never
			: true extends AnyIsEqual<TraversedTypes, V>
				? never
				: `${K}` | `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`
		: true extends AnyIsEqual<TraversedTypes, V>
			? never
			: `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`;

type ArrayPathInternal<T, TraversedTypes = T> = T extends ReadonlyArray<infer V>
	? IsTuple<T> extends true
		? {
				[K in TupleKeys<T>]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>;
			}[TupleKeys<T>]
		: ArrayPathImpl<number, V, TraversedTypes>
	: {
			[K in keyof T]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>;
		}[keyof T];

type ArrayPath<T> = T extends any ? ArrayPathInternal<T> : never;

export type PathValue<T, P extends Path<T> | ArrayPath<T>> = T extends any
	? P extends `${infer K}.${infer R}`
		? K extends keyof T
			? R extends Path<T[K]>
				? PathValue<T[K], R>
				: never
			: K extends `${number}`
				? T extends ReadonlyArray<infer V>
					? PathValue<V, R & Path<V>>
					: never
				: never
		: P extends keyof T
			? T[P]
			: P extends `${number}`
				? T extends ReadonlyArray<infer V>
					? V
					: never
				: never
	: never;

export type * from "type-fest";
