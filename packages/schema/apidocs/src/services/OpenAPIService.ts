import { type TSchema, Type, TypeGuard } from "@sinclair/typebox";
import {
	type Operation,
	type Parameter,
	type RequestBody,
	RouterException,
	getRoutes,
} from "@vermi/router";
import { getSchemas } from "@vermi/schema";
import {
	OpenApiBuilder,
	type OperationObject,
	type PathItemObject,
	type SecuritySchemeObject,
} from "openapi3-ts/oas31";
import type { OpenAPIConfig } from "../interfaces";
import * as utils from "../utils";
import { BaseAPIService, type BuildSpecsOptions } from "./BaseAPIService";
import { corsSchema, rateLimitSchemas } from "./builtin";

export class OpenAPIService extends BaseAPIService<OpenAPIConfig> {
	#builder: OpenApiBuilder;

	protected defaultSpecs = {
		openapi: "3.1.0",
		info: {
			title: "Vermi API",
			version: "1.0.0",
		},
		components: {},
		paths: {},
	};

	constructor(public config: OpenAPIConfig) {
		super(config);
		this.#builder = new OpenApiBuilder(this.mergeSpecs());
	}

	#buildOperation = (path: string, operation: Operation) => {
		const { method, route, operationId } = utils.getNames(
			path,
			operation,
			this.casingFn,
		);

		const item: OperationObject = {
			operationId,
			responses: operation.responses,
			summary: `${method.toUpperCase()} ${route}`,
		};

		const parameterArgs = operation.args?.filter((arg) => arg.in !== "body") as
			| Parameter[]
			| undefined;

		if (parameterArgs?.length) {
			item.parameters = utils.buildParameters(route, parameterArgs);
		}

		const requestBody = operation.args?.find((arg) => arg.in === "body") as
			| RequestBody
			| undefined;

		if (requestBody) {
			requestBody.name = requestBody.name || `${operationId}Body`;
			item.requestBody = utils.buildRequestBody(requestBody);
		}

		if (operation.security) {
			item.security = [Object.fromEntries(operation.security)];
		}

		const options: utils.ResponseOptions = {};

		if (this.features.rateLimit) {
			options.headers = {
				...options.headers,
				...utils.referTo("headers", [
					"X-RateLimit-Limit",
					"X-RateLimit-Remaining",
					"X-RateLimit-Reset",
					"Retry-After",
				]),
			};
		}
		if (this.features.cors) {
			options.headers = {
				...options.headers,
				...utils.referTo("headers", ["Access-Control-Allow-Origin"]),
			};
		}

		if (operation.responses) {
			item.responses = {
				...item.responses,
				...utils.buildResponses(operation.responses, options),
			};
		}

		const pathItem: PathItemObject = {
			[method.toLowerCase()]: item,
		};

		const parameters = utils.buildPathParams(route, parameterArgs || []);
		if (parameters) {
			pathItem.parameters = parameters;
		}

		this.#builder.addPath(route, pathItem);
	};

	#addSchemas(schemas: TSchema[]) {
		const addMore = (schema: TSchema) => {
			if (!schema.$id) {
				return;
			}
			if (schemas.every((s) => s.$id !== schema.$id)) {
				schemas.push(schema);
			}
		};
		// recursive function to find all nested schemas
		const findNested = (schema: TSchema) => {
			if (TypeGuard.IsObject(schema)) {
				const properties = schema.properties || {};

				for (const [name, value] of Object.entries(properties)) {
					if (TypeGuard.IsObject(value)) {
						if (value.$id) {
							addMore(value);
							properties[name] = Type.Ref(value.$id);
							schema.properties = properties;
						}
						findNested(value);
					} else if (TypeGuard.IsArray(value)) {
						if (value.items?.$id) {
							addMore(value.items);
							properties[name].items = Type.Ref(value.items.$id);
							schema.properties = properties;
						}
						findNested(value.items);
					}
				}
			}
		};

		for (const schema of schemas) {
			findNested(schema);
		}
		for (const schema of schemas) {
			const name = schema.$id?.split("/").pop();
			name && this.#builder.addSchema(name, schema);
		}
	}

	#enableCors() {
		if (this.features.cors) {
			this.#builder.addHeader("Access-Control-Allow-Origin", corsSchema);
		}
	}

	#enableRateLimit() {
		if (this.features.rateLimit) {
			this.#builder.addHeader("X-RateLimit-Limit", rateLimitSchemas.limit);
			this.#builder.addHeader(
				"X-RateLimit-Remaining",
				rateLimitSchemas.remaining,
			);
			this.#builder.addHeader("X-RateLimit-Reset", rateLimitSchemas.reset);
			this.#builder.addHeader("Retry-After", rateLimitSchemas.retryAfter);
		}
	}

	addSecuritySchemes(scheme: Record<string, SecuritySchemeObject>) {
		for (const [key, value] of Object.entries(scheme)) {
			this.#builder.addSecurityScheme(key, value);
		}
	}

	async buildSpecs({ serverUrl, title, casing }: BuildSpecsOptions) {
		this.chooseCasing(casing);
		const routes = getRoutes(this.config.routes);

		const unfiltered = getSchemas().filter((schema) => schema.$id);
		const schemas = [
			...new Map(unfiltered.map((pos) => [pos.$id, pos])).values(),
		];

		const url = serverUrl.replace(/\/$/, "");

		if (!this.#builder.rootDoc.servers?.some((server) => server.url === url)) {
			this.#builder.addServer({ url, "x-internal": true });
		}

		this.#builder.addTitle(title);

		this.#enableCors();
		this.#enableRateLimit();

		this.#addSchemas(
			[...schemas, RouterException.schema].map((s) => this.changeCase(s)),
		);

		const options: utils.ResponseOptions = {};

		if (this.features.rateLimit) {
			options.headers = {
				...options.headers,
				...utils.referTo("headers", [
					"X-RateLimit-Limit",
					"X-RateLimit-Remaining",
					"X-RateLimit-Reset",
					"Retry-After",
				]),
			};
		}
		if (this.features.cors) {
			options.headers = {
				...options.headers,
				...utils.referTo("headers", ["Access-Control-Allow-Origin"]),
			};
		}

		const errorResponse = utils.buildExceptionResponses(options);

		this.#builder.addResponse("RouterException", errorResponse);

		for (const [path, operation] of routes) {
			this.#buildOperation(path, operation);
		}

		return utils.removeUnused(this.#builder.getSpec());
	}
}
