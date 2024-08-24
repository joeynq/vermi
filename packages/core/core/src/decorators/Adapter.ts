import { camelCase } from "@vermi/utils";
import { Inject } from "./Inject";

export function Adapter(name: string) {
	return Inject(`adapter:${camelCase(name)}`);
}
