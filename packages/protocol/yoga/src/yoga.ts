import { createModule } from "@vermi/core";
import { YogaModule, type YogaModuleConfig } from "./YogaModule";

export const yoga = <Ctx extends Record<string, any>>(
	endpoint: string,
	options: Omit<YogaModuleConfig<Ctx>, "graphqlEndpoint">,
) => createModule(YogaModule)({ ...options, graphqlEndpoint: endpoint });
