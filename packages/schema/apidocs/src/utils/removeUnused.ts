import { stringify } from "@vermi/utils";
import type { OpenAPIObject } from "openapi3-ts/oas31";
import type { AsyncAPIObject } from "../interfaces/AsyncAPI";

export const removeUnused = (source: OpenAPIObject | AsyncAPIObject) => {
	const schemas = source.components?.schemas;

	if (!schemas || !source.components) {
		return source;
	}

	let found = true;
	while (found) {
		const json = stringify(source);
		const keys = Object.keys(schemas);

		let count = 0;
		for (const key of keys) {
			const id = `"#/components/schemas/${key}"`;
			if (json.split(id).length <= 2) {
				delete schemas[key];
				count++;
			}
		}
		source.components.schemas = schemas;
		found = count > 0;
	}

	// Remove all $id
	const idPattern = /"\$id":\s*"\#\/components\/schemas\/[^"]*",/g;

	const newSource = JSON.parse(stringify(source)?.replaceAll(idPattern, ""));

	return newSource;
};
