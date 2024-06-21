import { Database } from "bun:sqlite";
import type { ConfigureModule } from "@vermi/core";
import { SqliteModule } from "./SqliteModule";

export const sqlite = (
	options: ConstructorParameters<typeof Database>[1],
	fileName = ":memory:",
): ConfigureModule<SqliteModule> => {
	return [SqliteModule, [{ fileName, options }]];
};
