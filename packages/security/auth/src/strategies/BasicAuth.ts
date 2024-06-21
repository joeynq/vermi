import { Injectable } from "@vermi/core";
import { ensure } from "@vermi/utils";
import type { SecurityScheme } from "../interfaces";
import { Strategy } from "./Strategy";

export type BasicTokenAuthorize = {
	issuer: string;
	username: string;
	password: string;
};

@Injectable()
export class BasicAuth extends Strategy<BasicTokenAuthorize> {
	readonly securityScheme: SecurityScheme = {
		type: "http",
		scheme: "basic",
	};

	tokenType = "Basic";
	#encodeCredentials() {
		return btoa(
			`${this.config.options.username}:${this.config.options.password}`,
		);
	}

	async verify(token?: string) {
		ensure(token, "Token is required");
		ensure(token === this.#encodeCredentials(), "Invalid credentials");
		return true;
	}
}
