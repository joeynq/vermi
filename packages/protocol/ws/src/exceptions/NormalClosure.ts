import { WsCloseCode, WsException } from "./WsException";

export class NormalClosure extends WsException {
	code = WsCloseCode.Normal;
}
