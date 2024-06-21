import type { RequestContext } from "@vermi/core";

export enum RouterEvents {
	Match = "router:match",
	BeforeRoute = "router:beforeRoute",
	Guard = "router:routeGuard",
	BeforeHandle = "router:beforeHandle",
	AfterHandle = "router:afterHandle",
	AfterRoute = "router:afterRoute",
}

export type RouterEventsMap = {
	[RouterEvents.Match]: (
		context: RequestContext,
	) => Promise<Response | undefined>;

	[RouterEvents.BeforeRoute]: (
		context: RequestContext,
	) => Promise<Response | undefined>;

	[RouterEvents.Guard]: (
		context: RequestContext,
	) => Promise<Response | undefined>;

	[RouterEvents.BeforeHandle]: (
		context: RequestContext,
	) => Promise<Response | undefined>;

	[RouterEvents.AfterHandle]: <T>(
		context: RequestContext,
		result: T | undefined,
	) => Promise<Response | T | undefined>;

	[RouterEvents.AfterRoute]: (
		context: RequestContext,
		response?: Response,
	) => Promise<Response | undefined>;
};
