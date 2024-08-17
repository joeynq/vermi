import type { Class } from "@vermi/utils";
import { useDecorators } from "../utils";
import { Deps } from "./Deps";
import { Injectable } from "./Injectable";

export interface InterceptorOptions {
	deps?: Class<any>[];
}

export const Interceptor = ({ deps = [] }: InterceptorOptions = {}) => {
	return useDecorators(Injectable("SCOPED"), Deps(...deps));
};
