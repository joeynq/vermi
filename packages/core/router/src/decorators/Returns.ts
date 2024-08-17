import type { TSchema } from "@sinclair/typebox";
import type { HttpCodes } from "@vermi/core";
import { SchemaKey } from "@vermi/schema";
import { type Class } from "@vermi/utils";
import type { ContentType, MediaType } from "../interfaces";
import { routeStore } from "../stores";

export interface ReturnsOptions {
	contentType?: ContentType;
}

export const Returns = <T extends TSchema>(
	status: HttpCodes,
	model: Class<any> | T,
	options: ReturnsOptions = {},
) => {
	return (target: any, propertyKey: string | symbol) => {
		routeStore.apply(target.constructor).updateRoute(propertyKey, (current) => {
			if (!current.metadata.responses) {
				current.metadata.responses = new Map();
			}

			const content =
				current.metadata.responses.get(status)?.content ||
				new Map<`${string}/${string}`, MediaType>();

			const schema =
				model instanceof Function ? (model as any)[SchemaKey] : model;

			content.set(options.contentType || "application/json", {
				schema,
			});

			current.metadata.responses.set(status, { content });

			return current;
		});
	};
};
