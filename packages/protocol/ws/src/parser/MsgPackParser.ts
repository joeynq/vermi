import { decode, encode } from "@msgpack/msgpack";
import { Injectable } from "@vermi/core";
import type { Parser } from "../interfaces";

@Injectable()
export class MsgPackParser implements Parser {
	encode<T>(data: T) {
		return encode(data);
	}
	decode<T>(data: Uint8Array): T {
		return decode(data) as T;
	}
}
