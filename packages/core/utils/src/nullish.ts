export const isNull = (value: unknown): value is null => {
	return value === null;
};

export const isUndefined = (value: unknown): value is undefined => {
	return value === undefined;
};

export const isNil = (value: unknown): value is null | undefined => {
	return isNull(value) || isUndefined(value);
};
