import { Type } from "@sinclair/typebox";
import { useDecorators } from "@vermi/core";
import {
	Returns,
	Delete as RouterDelete,
	RouterException,
} from "@vermi/router";
import { type Class, snakeCase } from "@vermi/utils";
import { SingularName } from "./Resource";

export function Delete(resource: Class<any>) {
	const name = resource.prototype[SingularName];
	return useDecorators(
		RouterDelete(`/:${name.toLowerCase()}_id`, {
			operationId: snakeCase(`delete_${name}`),
		}),
		Returns(204, Type.Null()),
		Returns(401, RouterException.schema),
	);
}
