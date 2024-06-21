import { WsCloseCode, WsException } from "./WsException";

export class PolicyViolation extends WsException<WsCloseCode.PolicyViolation> {
	code = WsCloseCode.PolicyViolation as const;
}
