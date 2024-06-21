import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { type NextFunction } from "express";

export type ExpressMiddleware = (
	req: IncomingMessage,
	res: ServerResponse,
	next?: NextFunction,
) => void;

export async function promiseMiddleware(
	request: Request,
	middleware: ExpressMiddleware,
) {
	const incomingMessage = toIncomingMessage(request);
	const serverResponse = new ServerResponse(incomingMessage);

	await new Promise<void>((resolve, reject) => {
		return middleware(incomingMessage, serverResponse, (error: any) => {
			if (error) {
				return reject(error);
			}
			return resolve();
		});
	});

	return serverResponse.end();
}

const toIncomingMessage = (request: Request): IncomingMessage => {
	const incomingMessage = new IncomingMessage(new Socket());
	incomingMessage.url = request.url;
	incomingMessage.method = request.method;
	incomingMessage.headers = Object.fromEntries(request.headers.entries());

	const body = request.body;
	if (body) {
		incomingMessage.push(body);
		incomingMessage.push(null);
	}

	return incomingMessage;
};
