import { Type } from "@sinclair/typebox";
import type { RequestBody } from "@vermi/router";

export const buildRequestBody = (body: RequestBody) => {
	const bodySchema = body?.schema;

	if (bodySchema) {
		return {
			content: {
				[body?.contentType || "application/json"]: {
					schema: bodySchema.$id ? Type.Ref(bodySchema) : bodySchema,
				},
			},
			required: body?.required,
		};
	}

	return;
};
