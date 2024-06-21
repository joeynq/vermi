import { WsCloseCode, WsException } from "./WsException";

export class UnsupportedData extends WsException<WsCloseCode.UnsupportedData> {
	code = WsCloseCode.UnsupportedData as const;
}
