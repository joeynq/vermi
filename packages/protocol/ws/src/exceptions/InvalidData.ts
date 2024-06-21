import { WsCloseCode, WsException } from "./WsException";

export class InvalidData extends WsException<WsCloseCode.InvalidData> {
	code = WsCloseCode.InvalidData as const;
}
