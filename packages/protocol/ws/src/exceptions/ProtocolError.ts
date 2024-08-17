import { WsCloseCode, WsException } from "./WsException";

export class ProtocolError extends WsException {
	code = WsCloseCode.ProtocolError;
}
