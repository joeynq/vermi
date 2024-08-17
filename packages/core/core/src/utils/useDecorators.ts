export function useDecorators<
	Decorator extends
		| ClassDecorator
		| PropertyDecorator
		| ParameterDecorator
		| MethodDecorator,
>(decorator: Decorator, ...decorators: Decorator[]): Decorator;
export function useDecorators(decorator: any, ...decorators: any[]) {
	return (target: any, key: string, index: number) => {
		decorator(target, key, index);
		for (const decorator of decorators) {
			decorator(target, key, index);
		}
	};
}
