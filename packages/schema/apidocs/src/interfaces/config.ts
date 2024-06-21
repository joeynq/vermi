import type { SlashedPath } from "@vermi/router";
import type { LimitSettings } from "@vermi/schema";
import type { AsyncAPIObject } from "./AsyncAPI";
import type { OpenAPIObject } from "./OpenAPI";

export type ApiType = "openapi" | "asyncapi";

export interface APIFeatures {
	cors?: boolean;
	rateLimit?: boolean;
}

export interface CommonApiConfig {
	type: ApiType;
	casing?: "camel" | "snake" | "pascal" | "kebab";
	specs?: Partial<OpenAPIObject | AsyncAPIObject>;
	override?: boolean;
	title?: string;
	features?: APIFeatures;
	limits?: Partial<LimitSettings>;
}

export interface AsyncAPIConfig extends CommonApiConfig {
	type: "asyncapi";
	specs: Partial<AsyncAPIObject>;
}

export interface OpenAPIConfig extends CommonApiConfig {
	type: "openapi";
	routes?: SlashedPath[]; // undefined means all routes
	specs: Partial<OpenAPIObject>;
}

export type ApiConfig = (OpenAPIConfig | AsyncAPIConfig) & {
	mount: SlashedPath;
};
