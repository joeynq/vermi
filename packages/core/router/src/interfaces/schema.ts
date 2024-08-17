import type { TSchema } from "@sinclair/typebox";
import type { HttpCodes } from "@vermi/core";
import type { Class, HTTPMethod } from "@vermi/utils";
import type { Mapper } from "../services";

export type ContentType = `${string}/${string}`;

export type SlashedPath = `/${string}`;

export type FullPath = `${HTTPMethod}${SlashedPath}`;

export interface Handler {
	target: string;
	action: string;
}

interface WithSchema {
	name?: string;
	schema: TSchema;
	required?: boolean;
}

export interface MediaType extends WithSchema {
	mediaType?: string;
}

export interface Response {
	content: Map<ContentType, MediaType>;
	headers?: Map<string, WithSchema>;
}

interface CommonArg extends WithSchema {
	index?: number;
	pipes?: Class<Mapper<any, any>>[];
}

export interface Parameter extends CommonArg {
	in: "path" | "query" | "header" | "cookie";
}

export interface RequestBody extends CommonArg {
	in: "body";
	contentType?: ContentType;
}

export interface Operation {
	mount?: SlashedPath;
	operationId?: string;
	responses?: Map<HttpCodes, Response>;
	security?: Map<string, string[]>;
	handler: Handler;
	args?: (Parameter | RequestBody)[];
}

export interface Routes {
	paths: Map<FullPath, Operation>;
	webhooks?: Map<FullPath, Operation>;
	security?: Map<string, string[]>;
}
