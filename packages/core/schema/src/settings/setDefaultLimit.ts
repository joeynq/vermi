import { type LimitSettings, limitSettings } from "./values";

export const setDefaultLimit = (limit: Partial<LimitSettings>) => {
	Object.assign(limitSettings, limit);
};
