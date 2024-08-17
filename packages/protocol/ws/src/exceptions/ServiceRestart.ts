import { WsCloseCode, WsException } from "./WsException";

export class ServiceRestart extends WsException<WsCloseCode.ServiceRestart> {
	code = WsCloseCode.ServiceRestart as const;
}
