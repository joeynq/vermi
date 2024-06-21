import { useDecorators } from "@vermi/core";
import { Get, Returns, RouterException } from "@vermi/router";
import { generic } from "@vermi/schema";
import { type Class, snakeCase } from "@vermi/utils";
import { Pagination, Single } from "../models";
import { PluralName, SingularName } from "./Resource";

export function Read(resource: Class<any> | [Class<any>]) {
	const isSingle = !Array.isArray(resource);
	const ResourceClass = isSingle ? resource : resource[0];

	const singular = ResourceClass.prototype[SingularName];
	const plural = ResourceClass.prototype[PluralName];

	return useDecorators(
		Get(isSingle ? `/:${singular.toLowerCase()}_id` : "/", {
			operationId: snakeCase(isSingle ? `get_${singular}` : `list_${plural}`),
		}),
		Returns(401, RouterException.schema),
		isSingle
			? Returns(200, generic(Single).of(ResourceClass))
			: Returns(200, generic(Pagination).of(ResourceClass)),
	);
}
