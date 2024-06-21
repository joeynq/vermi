import {
	HttpErrorCodes,
	HttpException,
	HttpRedirectCodes,
	HttpSuccessCodes,
} from "@vermi/core";
import { stringify } from "@vermi/utils";
import type { BunFile } from "bun";
import { InternalServerError } from "../exceptions";

const defaultHeaders = {
	"Content-Type": "application/json",
};

const response = (
	status: number,
	data: unknown,
	headers: Record<string, any> = defaultHeaders,
) => {
	const headerInit = new Headers();
	if (headers) {
		for (const [key, value] of Object.entries(headers)) {
			headerInit.set(key, value);
		}
	}

	const returnData: string | null =
		typeof data === "string"
			? data
			: data === null
				? null
				: stringify(data) ?? null;

	return new Response(returnData, {
		status,
		headers: headerInit,
	});
};

export const Res = {
	response,
	html(data: string) {
		return response(HttpSuccessCodes.Ok, data, {
			"Content-Type": "text/html",
		});
	},
	file(data: BunFile) {
		return response(HttpSuccessCodes.Ok, data, {
			"Content-Type": "application/octet-stream",
		});
	},
	empty(headers: Record<string, any> = defaultHeaders) {
		return response(HttpSuccessCodes.NoContent, null, headers);
	},
	ok(data: unknown, headers: Record<string, any> = defaultHeaders) {
		return response(HttpSuccessCodes.Ok, data, headers);
	},
	created(data: unknown, headers: Record<string, any> = defaultHeaders) {
		return response(HttpSuccessCodes.Created, data, headers);
	},
	error(error: Error, headers: Record<string, any> = defaultHeaders) {
		if (error instanceof HttpException) {
			return response(error.status, { error: error.toJSON() }, headers);
		}
		return response(
			HttpErrorCodes.InternalServerError,
			{
				error: new InternalServerError(error.message, error).toJSON(),
			},
			headers,
		);
	},
	redirect(
		url: string,
		status = HttpRedirectCodes.MovedPermanently,
		headers: Record<string, any> = defaultHeaders,
	) {
		return response(status, null, {
			...headers,
			Location: url,
		});
	},
};
