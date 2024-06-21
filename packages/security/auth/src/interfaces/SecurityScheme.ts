export type SecuritySchemeType = "apiKey" | "http" | "oauth2" | "openIdConnect";

export interface SecurityScheme {
	type: SecuritySchemeType;
	description?: string;
	name?: string;
	in?: "query" | "header" | "cookie";
	scheme?: "bearer" | "basic" | "digest" | "ho" | "custom";
	bearerFormat?: "JWT" | "token";
	flows?: OAuthFlowsObject;
	openIdConnectUrl?: string;
}

export interface OAuthFlowsObject {
	implicit?: OAuthFlowObject;
	password?: OAuthFlowObject;
	clientCredentials?: OAuthFlowObject;
	authorizationCode?: OAuthFlowObject;
}

export interface OAuthFlowObject {
	authorizationUrl?: string;
	tokenUrl?: string;
	refreshUrl?: string;
	scopes: Record<string, any>;
}
