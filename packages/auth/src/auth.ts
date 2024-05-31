import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { AuthModule } from "./AuthModule";
import type { Strategy } from "./strategies";

export interface AuthOptions {
	config: ConstructorParameters<Class<AuthModule<any>>>[0];
	schemeName?: string;
}

export const auth = <S extends Strategy<any>, SClass extends Class<S>>(
	Strategy: SClass,
	{ config, schemeName }: AuthOptions,
): UseModule<AuthModule<S>> => {
	const strategy = new Strategy(config);
	const name = schemeName || Strategy.name;

	return [
		AuthModule,
		{
			[Strategy.name]: {
				strategy,
				scheme: {
					[name]: strategy.securityScheme,
				},
			},
		},
	];
};
