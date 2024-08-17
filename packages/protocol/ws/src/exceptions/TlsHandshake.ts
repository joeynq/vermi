import { WsCloseCode, WsException } from "./WsException";

export class TlsHandshake extends WsException<WsCloseCode.TlsHandshake> {
	code = WsCloseCode.TlsHandshake as const;
}
