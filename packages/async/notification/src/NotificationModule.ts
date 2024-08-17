import {
	AppHook,
	Config,
	Logger,
	type LoggerAdapter,
	Module,
	VermiModule,
} from "@vermi/core";
import type { AdapterConfigMap, Templates } from "./interfaces";
import { NotificationService } from "./services";

export type NotificationModuleConfig<T extends Templates> = {
	channels: Partial<AdapterConfigMap>;
	templates: T;
};

@Module({ deps: [NotificationService] })
export class NotificationModule<T extends Templates> extends VermiModule<
	NotificationModuleConfig<T>
> {
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: NotificationModuleConfig<T>;

	constructor(protected notificationService: NotificationService) {
		super();
	}

	@AppHook("app:exit")
	async exit() {
		this.notificationService.unmount();
	}

	@AppHook("app:init")
	async init() {
		this.notificationService.onError((message) => {
			this.logger.error(message);
		});

		this.notificationService.onMessage((data) => {
			this.logger.info(data);
		});

		this.notificationService.send({
			channel: "email",
			template: "sample",
			data: { name: "John Doe" },
			to: "nguyenquocdat.vn@gmail.com",
		});
	}
}
