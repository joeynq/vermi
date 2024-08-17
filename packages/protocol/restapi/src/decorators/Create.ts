import { useDecorators } from "@vermi/core";
import { Post, Returns, RouterException } from "@vermi/router";
import { generic } from "@vermi/schema";
import { type Class, snakeCase } from "@vermi/utils";
import { Single } from "../models";

export function Create(resource: Class<any>) {
	return useDecorators(
		Post("/", {
			operationId: snakeCase(`create_${resource.name.toLowerCase()}`),
		}),
		Returns(201, generic(Single).of(resource)),
		Returns(401, RouterException.schema),
	);
}
