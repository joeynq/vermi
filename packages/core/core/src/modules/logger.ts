import type { Class } from "@vermi/utils";
import type { AbstractLogger, LoggerAdapter, WithAdapter } from "../interfaces";
import { withAdapter } from "./withAdapter";

type ProviderConfig<Logger extends AbstractLogger> = NonNullable<
	WithAdapter<LoggerAdapter<Logger>>["adapter"]
>["provider"];

export const logger = <Logger extends AbstractLogger>(
	adapter: Class<LoggerAdapter<Logger>>,
	provider: ProviderConfig<Logger>,
) => {
	return withAdapter({
		adapter: {
			class: adapter,
			provider,
			name: "default",
		},
	});
};

export const LoggerToken = "adapter:logger:default";
