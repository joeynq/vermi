import { type Class, extendedCamelCase } from "@vermi/utils";
import type { AppContext, InterceptorMethods } from "../interfaces";
import { dependentStore } from "../store";
import { asClass, asValue, useDecorators } from "../utils";

export const Intercept = <Interceptor extends InterceptorMethods<any>>(
	interceptor: Class<Interceptor>,
	options?: any,
): MethodDecorator => {
	return useDecorators(
		(target: any) => {
			dependentStore.apply(target.constructor).addDependents(interceptor);
		},
		(
			target: any,
			propertyKey: string | symbol,
			descriptor: TypedPropertyDescriptor<any>,
		) => {
			const originalMethod = target[propertyKey];
			const name = extendedCamelCase(interceptor.name);

			descriptor.value = async <Context extends AppContext>(
				context: Context,
			) => {
				options && context.register(`${name}:options`, asValue(options));
				const interceptorInstance = context.build(asClass(interceptor));

				return interceptorInstance.intercept(context, (...args: any[]) =>
					originalMethod.call(target, ...args),
				);
			};
		},
	);
};
