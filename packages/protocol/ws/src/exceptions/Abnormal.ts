import { WsCloseCode, WsException } from "./WsException";

export class Abnormal extends WsException<WsCloseCode.Abnormal> {
	code = WsCloseCode.Abnormal as const;
}
