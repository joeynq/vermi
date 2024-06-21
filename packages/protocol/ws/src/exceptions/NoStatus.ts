import { WsCloseCode, WsException } from "./WsException";

export class NoStatus extends WsException<WsCloseCode.NoStatus> {
	code = WsCloseCode.NoStatus as const;
}
