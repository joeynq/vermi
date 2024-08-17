import { WsCloseCode, WsException } from "./WsException";

export class MissingExtension extends WsException<WsCloseCode.MissingExtension> {
	code = WsCloseCode.MissingExtension as const;
}
