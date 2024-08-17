import {
	type IMany,
	type IPagination,
	type ISingle,
	Many,
	Pagination,
	Single,
} from "../models";

function single<T>(data: T): ISingle<T> {
	return new Single(data);
}

function empty(): void {
	return;
}

function multiple<T>(
	data: T[],
	total: number,
	paging: { page: number; limit: number },
): IPagination<T>;
function multiple<T>(data: T[]): IMany<T>;
function multiple<T>(
	data: T[],
	total?: number,
	paging?: { page: number; limit: number },
) {
	if (total && paging) {
		return new Pagination(data, total, paging.page, paging.limit);
	}
	return new Many(data, data.length);
}

export const Result = {
	single,
	empty,
	multiple,
};
