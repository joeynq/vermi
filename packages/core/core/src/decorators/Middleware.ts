import type { Class } from "@vermi/utils";
import { useDecorators } from "../utils";
import { Deps } from "./Deps";
import { Injectable } from "./Injectable";

export interface MiddlewareOptions {
	deps?: Class<any>[];
}

export function Middleware({ deps = [] }: MiddlewareOptions = {}) {
	return useDecorators(Injectable("SCOPED"), Deps(...deps));
}
