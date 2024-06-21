import { Inject } from "@vermi/core";
import { getToken } from "../utils";

export function Em(contextName = "default") {
	return Inject(`${getToken(contextName)}.em`);
}
