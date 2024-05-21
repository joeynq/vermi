import { useDecorators } from "@vermi/core";
import { Returns, generic } from "@vermi/openapi";
import { Put, RouterException } from "@vermi/router";
import { type Class, snakeCase } from "@vermi/utils";
import { Single } from "../models";
import { SingularName } from "./Resource";

export function Update(resource: Class<any>) {
	const name = resource.prototype[SingularName];
	return useDecorators(
		Put(`/:${name.toLowerCase()}_id`, {
			operationId: snakeCase(`replace_${name}`),
		}),
		Returns(200, generic(Single).of(resource)),
		Returns(401, RouterException.schema),
	);
}
