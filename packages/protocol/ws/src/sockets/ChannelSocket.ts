import { SocketController, Subscribe } from "../decorators";
import type { WsContext } from "../interfaces";

@SocketController("/")
export class ChannelSocket {
	@Subscribe("subscribe")
	async subscribe(ctx: WsContext) {
		const { ws, event } = ctx.store;
		event.data && ws.subscribe(event.data);
	}

	@Subscribe("unsubscribe")
	async unsubscribe(ctx: WsContext) {
		const { ws, event } = ctx.store;
		event.data && ws.unsubscribe(event.data);
	}
}
