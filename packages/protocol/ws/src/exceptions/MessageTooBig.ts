import { WsCloseCode, WsException } from "./WsException";

export class MessageTooBig extends WsException<WsCloseCode.MessageTooBig> {
	code = WsCloseCode.MessageTooBig as const;
}
