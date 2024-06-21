import { WsCloseCode, WsException } from "./WsException";

export class InternalError extends WsException<WsCloseCode.InternalError> {
	code = WsCloseCode.InternalError as const;
}
