import { Injectable } from "@vermi/core";
import type { Parser } from "./Parser";

@Injectable()
export class JsonParser implements Parser {
	encode<T>(data: T) {
		return new TextEncoder().encode(JSON.stringify(data));
	}
	decode<T>(data: Uint8Array): T {
		return JSON.parse(new TextDecoder().decode(data));
	}
}
