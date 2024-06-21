import type { Class } from "@vermi/utils";
import { useDecorators } from "../utils";
import { Deps } from "./Deps";
import { Injectable } from "./Injectable";

export interface ModuleOptions {
	deps?: Class<any>[];
}

export const Module = ({ deps = [] }: ModuleOptions = {}) => {
	return useDecorators(Injectable("SINGLETON"), Deps(...deps));
};
