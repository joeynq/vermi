import { On, SocketController } from "@vermi/ws";

@SocketController("/ws")
export class TestEvent {
	@On("message")
	public async handle() {
		console.log("TestEvent handled");
	}
}
