import type { TSchema } from "@sinclair/typebox";
import type { ContentType, MediaType } from "@vermi/router";

export const createResponse = (
	schema: TSchema,
): { content: Map<ContentType, MediaType> } => {
	const content = new Map<ContentType, MediaType>();
	content.set("application/json", { schema });
	return { content };
};
