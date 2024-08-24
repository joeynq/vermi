import { type WithAdapter } from "@vermi/core";
import type { NotificationAdapter, Templates } from "./interfaces";

export interface NotificationModuleConfig<
	Provider,
	Adapter extends NotificationAdapter<Provider, any>,
> extends WithAdapter<Provider, Adapter> {
	channel: string;
	templates: Templates;
}

// @Module({ deps: [NotificationService] })
// export class NotificationModule<
// 	Provider,
// 	Adapter extends NotificationAdapter<Provider, any>,
// > extends VermiModule<NotificationModuleConfig<Provider, Adapter>> {
// 	@Logger() private logger!: LoggerAdapter;
// 	@Config() public config!: NotificationModuleConfig<Provider, Adapter>[];

// 	constructor(protected notificationService: NotificationService) {
// 		super();
// 	}

// 	@AppHook("app:exit")
// 	async exit() {
// 		this.notificationService.unmount();
// 	}

// 	@AppHook("app:init")
// 	async init() {
// 		this.notificationService.onError((message) => {
// 			this.logger.error(message);
// 		});

// 		this.notificationService.onMessage((data) => {
// 			this.logger.info(data);
// 		});

// 		this.notificationService.send({
// 			channel: "email",
// 			template: "sample",
// 			data: { name: "John Doe" },
// 			to: "nguyenquocdat.vn@gmail.com",
// 		});
// 	}
// }
