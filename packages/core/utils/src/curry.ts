export const composeSync = (...fns: Array<(...arg: any[]) => void>) => {
	return (...args: any[]) => {
		for (const fn of fns) {
			fn(...args);
		}
	};
};

export const compose = (...fns: Array<(...arg: any[]) => Promise<void>>) => {
	return async (...arg: any[]) => {
		for (const fn of fns) {
			await fn(...arg);
		}
	};
};

export const pipeSync =
	<T>(...fns: Array<(arg: T) => T>) =>
	(arg: T) => {
		return fns.reduce((acc, fn) => fn(acc), arg);
	};

export const pipe =
	<T>(...fns: Array<(arg: T) => Promise<T>>) =>
	async (arg: T) => {
		let result = arg;
		for (const fn of fns) {
			result = await fn(result);
		}
		return result;
	};

export async function tryRun<Err extends Error, T>(
	fn: (...args: any[]) => Promise<T>,
): Promise<[Err] | [null, T]> {
	try {
		return [null, await fn()];
	} catch (error) {
		return [error as Err];
	}
}
