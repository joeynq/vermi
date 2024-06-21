import {
	camelCase,
	changeObjectCase,
	kebabCase,
	pascalCase,
	snakeCase,
} from "@vermi/utils";

export type CasingType = "camel" | "snake" | "pascal" | "kebab";

export class Casing {
	constructor(private fn: (input: string) => string) {}

	convert<T extends object>(obj: T): T {
		return changeObjectCase(obj, this.fn);
	}
}

export const casingFactory = (type: CasingType) => {
	switch (type) {
		case "camel":
			return new Casing(camelCase);
		case "snake":
			return new Casing(snakeCase);
		case "pascal":
			return new Casing(pascalCase);
		case "kebab":
			return new Casing(kebabCase);
	}
};
