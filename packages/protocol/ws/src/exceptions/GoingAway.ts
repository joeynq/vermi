import { WsCloseCode, WsException } from "./WsException";

export class GoingAway extends WsException {
	code = WsCloseCode.GoingAway;
}
