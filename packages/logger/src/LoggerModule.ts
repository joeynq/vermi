import {
	type Context,
	type EnhancedContainer,
	type InitContext,
	type LoggerAdapter,
	LoggerKey,
	Module,
	YabHook,
} from "@yab/core";

export type LoggerModuleConfig<Adapter extends LoggerAdapter> = {
	adapter: Adapter;
};

export class LoggerModule<Adapter extends LoggerAdapter> extends Module<
	LoggerModuleConfig<Adapter>
> {
	constructor(public config: LoggerModuleConfig<Adapter>) {
		super();
	}

	@YabHook("app:init")
	async init({ container }: InitContext) {
		container.registerValue(LoggerKey.toString(), this.config.adapter);
	}

	@YabHook("app:request")
	async applyContext(ctx: Context) {
		ctx.logger = this.config.adapter.useContext(ctx);
	}
}
