import { WsCloseCode, WsException } from "./WsException";

export class TryAgainLater extends WsException<WsCloseCode.TryAgainLater> {
	code = WsCloseCode.TryAgainLater as const;
}
