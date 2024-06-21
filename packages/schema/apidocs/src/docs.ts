import type { ConfigureModule } from "@vermi/core";
import type { SlashedPath } from "@vermi/router";
import { ApiDocsModule } from "./ApiDocsModule";
import type { AsyncAPIConfig, OpenAPIConfig } from "./interfaces";

export const docs = (
	mount: SlashedPath,
	options: OpenAPIConfig | AsyncAPIConfig,
): ConfigureModule<ApiDocsModule> => {
	return [ApiDocsModule, [{ ...options, mount }]];
};
