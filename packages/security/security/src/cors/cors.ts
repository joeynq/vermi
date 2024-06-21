import type { ConfigureModule } from "@vermi/core";
import { type CorsConfig, CorsModule } from "./CorsModule";

export const cors = (options: CorsConfig = {}): ConfigureModule<CorsModule> => [
	CorsModule,
	options,
];
