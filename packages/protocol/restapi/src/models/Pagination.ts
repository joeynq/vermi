import { Generic, Integer } from "@vermi/schema";
import { type IMany, Many } from "./Many";

export interface IPagination<Resource> extends IMany<Resource> {
	page: number;
	limit: number;
}

@Generic()
export class Pagination<T> extends Many<T> implements IPagination<T> {
	@Integer({ minimum: 1, maximum: 9999 })
	page!: number;

	@Integer({ minimum: 1, maximum: 100 })
	limit!: number;

	constructor(data: T[], total: number, page: number, limit: number) {
		super(data, total);
		this.page = page;
		this.limit = limit;
	}
}
