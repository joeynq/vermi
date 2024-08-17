export const parseQuery = <T>(search: string, depth = 3) => {
	const parse = require("faster-qs").default;
	return parse(search, depth) as T;
};

export const searchString = (url: string) => {
	return new URL(url).search.replace("?", "");
};

export const pathname = (url: string) => {
	return new URL(url).pathname;
};

export const pathStartsWith = (url: string, start: string) => {
	return pathname(url).startsWith(start);
};

export const pathIs = (url: string, path: string) => {
	return pathname(url) === path;
};

export const getParam = (url: string, name: string) => {
	const urlPath = new URL(url);
	const searchParams = urlPath.searchParams;
	return searchParams.get(name);
};

export const getCookies = (cookie: string) => {
	const cookies = cookie.split(";").map((cookie) => cookie.split("="));
	return Object.fromEntries(cookies);
};
