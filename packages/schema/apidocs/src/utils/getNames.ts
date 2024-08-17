import type { Operation } from "@vermi/router";

export const getNames = (
	path: string,
	operation: Operation,
	casingFn?: (input: string) => string,
) => {
	const method = path.split("/")[0];

	const route = path.slice(method.length).replace(/:(\w+)/g, "{$1}");

	const opId =
		operation.operationId ||
		`${operation.handler.action}_${operation.handler.target}`;

	return {
		operationId: casingFn ? casingFn(opId) : opId,
		route,
		method,
	};
};
