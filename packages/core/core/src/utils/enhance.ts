import {
	type AwilixContainer,
	RESOLVER,
	aliasTo,
	asClass,
	asFunction,
	asValue,
} from "awilix";
import { getTokenName } from ".";
import {
	type EnhancedContainer,
	type ExposedContext,
	type InjectionToken,
} from "../interfaces";

export { asClass, asFunction, asValue, aliasTo, RESOLVER };

export const enhance = <T extends object>(container: AwilixContainer<T>) => {
	Object.defineProperty(container, "expose", {
		value: function (): ExposedContext<T> {
			return {
				get store() {
					return container.cradle;
				},
				resolve: <T>(token: InjectionToken<T>) => {
					const tokenName = getTokenName(token);

					const self = this as AwilixContainer;

					if (!self.hasRegistration(tokenName)) {
						return undefined;
					}
					return self.resolve(tokenName);
				},
				register: (this as EnhancedContainer<T>).register.bind(this),
				build: (this as EnhancedContainer<T>).build.bind(this),
			};
		},
	});

	Object.defineProperty(container, "createEnhancedScope", {
		value: function () {
			return enhance((this as AwilixContainer<T>).createScope());
		},
	});

	return container as EnhancedContainer<T>;
};
