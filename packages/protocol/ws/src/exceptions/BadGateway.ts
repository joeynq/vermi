import { WsCloseCode, WsException } from "./WsException";

export class BadGateway extends WsException<WsCloseCode.BadGateway> {
	code = WsCloseCode.BadGateway as const;
}
