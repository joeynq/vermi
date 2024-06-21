import type { OpenAPIConfig } from "../interfaces";

export const isOpenAPI = (config: any): config is OpenAPIConfig => {
	return config.type === "openapi";
};
