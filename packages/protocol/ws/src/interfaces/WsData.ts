export type SlashedPath = `/${string}`;

export interface WsData {
	sid: string;
	path: SlashedPath;
	[key: string]: any;
}
