import { containerRef } from "@vermi/core";

export function Db(name: string) {
	return (target: any, propertyKey: string) => {
		Object.defineProperty(target, propertyKey, {
			get() {
				return containerRef().cradle.dataSources[name];
			},
		});
	};
}
