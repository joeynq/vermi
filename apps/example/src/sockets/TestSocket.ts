import { Logger, type LoggerAdapter } from "@vermi/core";
import { Model, Number, String } from "@vermi/schema";
import { On, SocketController } from "@vermi/ws";

@Model()
class TestModel {
	@String()
	foo!: string;

	@Number()
	bar!: number;
}

@SocketController("/test")
export class TestSocket {
	@Logger()
	logger!: LoggerAdapter;

	@On("connect")
	async onConnect(ctx: any) {
		this.logger.info("connected");
		console.log(ctx);
	}

	@On("message")
	async onMessage(ctx: any) {
		this.logger.info("some-message");
		console.log(ctx);
	}
}
