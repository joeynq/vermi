import type { ConfigureModule } from "@vermi/core";
import type { DataSourceOptions } from "typeorm";
import { TypeormModule } from "./TypeormModule";

export const typeorm = (
	name: string,
	config: DataSourceOptions,
): ConfigureModule<TypeormModule> => [TypeormModule, { [name]: config }];
