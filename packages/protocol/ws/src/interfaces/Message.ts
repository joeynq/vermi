export interface MessageDTO<Data> {
	sid: string;
	timestamp: Date;
	data?: Data;
}
