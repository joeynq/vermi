import {
	type AnyFunction,
	type Class,
	type Dictionary,
	deepMerge,
} from "@vermi/utils";

function get<T>(token: string | symbol, target: Class<any>) {
	return Reflect.getMetadata(token, target) as T;
}

function set<T>(token: string | symbol, target: Class<any>, value: T) {
	Reflect.defineMetadata(token, value, target);
}

function merge<T>(
	token: string | symbol,
	target: Class<any>,
	value: Partial<T>,
) {
	const current = Reflect.getMetadata(token, target) as T;
	Reflect.defineMetadata(token, deepMerge(current, value), target);
}

export type StoreToken = symbol | string;

export type GetMetadata<T> = () => T;

export type SetMetadata<T> = (value: T) => void;

export type MergeMetadata<T> = (value: Partial<T>) => void;

export type APIFactory<T, API extends Dictionary<AnyFunction>> = (
	target: Class<any>,
	get: GetMetadata<T>,
	set: SetMetadata<T>,
	merge: MergeMetadata<T>,
) => API;

class Store<T extends object, API extends Dictionary<AnyFunction>> {
	constructor(
		public token: StoreToken,
		public apis: APIFactory<T, API>,
		public initialValue: () => T,
	) {}

	combine(...providers: Class<any>[]) {
		const stores = providers
			.map((provider) => this.apply(provider).get())
			.filter(Boolean);

		if (stores.length === 0) {
			return;
		}

		return deepMerge(...stores) as T;
	}

	apply(target: Class<any>) {
		const data = get<T>(this.token, target);
		if (data === undefined) {
			set<T>(this.token, target, this.initialValue());
		}

		return {
			...this.apis(
				target,
				() => get<T>(this.token, target),
				(value) => set<T>(this.token, target, value),
				(value) => merge<T>(this.token, target, value),
			),
			get: () => get<T>(this.token, target),
		};
	}
}

export function createStore<
	T extends object,
	API extends Dictionary<AnyFunction>,
>(token: StoreToken, apis: APIFactory<T, API>, initialValue: () => T) {
	return new Store(token, apis, initialValue);
}
