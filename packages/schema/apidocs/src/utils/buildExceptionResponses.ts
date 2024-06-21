import type { ResponseOptions } from "./buildResponses";

export const buildExceptionResponses = (options?: ResponseOptions) => {
	return {
		description: "Client Error",
		...options,
		content: {
			"application/json": {
				schema: { $ref: "#/components/schemas/Exception" },
			},
		},
	};
};
