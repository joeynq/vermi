import type { TSchema } from "@sinclair/typebox";
import { setDefaultLimit } from "@vermi/schema";
import {
	camelCase,
	deepMerge,
	kebabCase,
	pascalCase,
	snakeCase,
} from "@vermi/utils";
import type { APIFeatures, CommonApiConfig } from "../interfaces";
import { changePropCase } from "../utils";

type UndoPartial<T> = T extends Partial<infer R> ? R : T;

export interface BuildSpecsOptions {
	serverUrl: string;
	title: string;
	casing?: "camel" | "snake" | "pascal" | "kebab";
}

export abstract class BaseAPIService<Config extends CommonApiConfig> {
	get features(): APIFeatures {
		return (
			this.config.features || {
				cors: false,
				rateLimit: false,
			}
		);
	}

	protected casingFn?: (str: string) => string;

	// abstract chooseCasing(casing?: "camel" | "snake" | "pascal" | "kebab"): void;
	protected abstract defaultSpecs: Config["specs"];

	constructor(public config: Config) {
		this.defaultLimit();
	}

	protected chooseCasing(casing?: "camel" | "snake" | "pascal" | "kebab") {
		switch (casing) {
			case "camel":
				this.casingFn = camelCase;
				break;
			case "snake":
				this.casingFn = snakeCase;
				break;
			case "pascal":
				this.casingFn = pascalCase;
				break;
			case "kebab":
				this.casingFn = kebabCase;
				break;
		}
	}

	protected changeCase(schema: TSchema) {
		if (this.casingFn) {
			return changePropCase(schema, this.casingFn);
		}
		return schema;
	}

	protected defaultLimit() {
		const { limits } = this.config;
		limits && setDefaultLimit(limits || {});
	}

	protected mergeSpecs() {
		const { specs, override } = this.config;
		let mergedSpecs: Config["specs"];
		if (override) {
			mergedSpecs = (specs as Config["specs"]) || this.defaultSpecs;
		} else {
			mergedSpecs = deepMerge(
				this.defaultSpecs,
				specs || {},
			) as Config["specs"];
		}

		return mergedSpecs as UndoPartial<Config["specs"]>;
	}

	abstract addSecuritySchemes(scheme: Record<string, any>): void;
	abstract buildSpecs(options: BuildSpecsOptions): void;
}
