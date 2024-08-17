import { AsyncLocalStorage } from "node:async_hooks";
import { Injectable } from "../decorators";
import type { EnhancedContainer, _AppContext } from "../interfaces";

const store = new AsyncLocalStorage<EnhancedContainer<_AppContext>>();

export const containerRef = <
	T extends object = _AppContext,
>(): EnhancedContainer<T> => {
	return store.getStore() as EnhancedContainer<T>;
};

@Injectable("SINGLETON")
export class ContextService {
	get context() {
		return store.getStore();
	}

	setContext(context: EnhancedContainer<any>) {
		store.enterWith(context);
	}

	clearContext(cb: () => void) {
		store.exit(cb);
	}

	async runInContext<Context extends _AppContext, T>(
		context: EnhancedContainer<_AppContext>,
		cb: (stored: EnhancedContainer<Context>) => T | Promise<T>,
	) {
		return store.run(context, async () => {
			cb(store.getStore() as EnhancedContainer<Context>);
		});

		// const [error, result] = await tryRun(async () => {
		// 	this.setContext(context);
		// 	return cb(store.getStore() as EnhancedContainer<Context>);
		// });

		// this.clearContext(exitCb);

		// if (error) {
		// 	context.cradle.logger.error(error);
		// 	return Promise.reject(error);
		// }

		// return result;
	}
}
