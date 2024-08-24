import { Type } from "@sinclair/typebox";
import type { EnumValues } from "@vermi/utils";

export enum WsCloseCode {
	Normal = 1000,
	GoingAway = 1001,
	ProtocolError = 1002,
	UnsupportedData = 1003,
	NoStatus = 1005,
	Abnormal = 1006,
	InvalidData = 1007,
	PolicyViolation = 1008,
	MessageTooBig = 1009,
	MissingExtension = 1010,
	InternalError = 1011,
	ServiceRestart = 1012,
	TryAgainLater = 1013,
	BadGateway = 1014,
	TlsHandshake = 1015,
}

export interface WsExceptionDTO {
	code: number;
	reason: string;
	sid: string;
	trace?: string;
}

export class WsException<
	Code extends EnumValues<typeof WsCloseCode, number> = EnumValues<
		typeof WsCloseCode,
		number
	>,
> extends Error {
	static schema = Type.Object({
		code: Type.Integer({ minimum: 1000, maximum: 1015, format: "int32" }),
		reason: Type.String({ maxLength: 1024, minLength: 1 }),
		sid: Type.String({ maxLength: 64, minLength: 1 }),
		trace: Type.Optional(Type.String({ maxLength: 1024, minLength: 1 })),
	});

	protected code!: Code;
	constructor(
		public sid: string,
		public reason: string,
		public cause?: Error,
	) {
		super(reason, { cause });
	}

	toJSON(): WsExceptionDTO {
		return {
			code: this.code,
			reason: this.reason,
			sid: this.sid,
			trace: this.cause?.stack,
		};
	}
}
