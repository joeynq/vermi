export type SlashedPath = `/${string}`;

export interface WsData {
	sid: string;
	namespace: SlashedPath;
	[key: string]: any;
}
