export interface LimitSettings {
	/* The maximum number of items allowed in an array. Default is 100. */
	arrayMaxItems: number;

	/* The maximum length of a string. Default is 1024. */
	stringMaxLength: number;

	/* The minimum value allowed for a number in the application. Default is 1. */
	numberMinimum: number;

	/* The maximum value allowed for a number in the application. Default is 10000. */
	numberMaximum: number;

	/* The maximum page size allowed for a paginated response. Default is 1000. */
	maxPageSize: number;

	/* The maximum number of data returns allowed in a single request. Default is 100. */
	maxDataReturns: number;

	/* The maximum file length allowed for a file upload. Default is 100MiB. */
	maxFileLength: number;

	/* The minimum length allowed for a password. Default is 8. */
	passwordMinLength: number;

	/* The maximum length allowed for a password. Default is 100. */
	passwordMaxLength: number;
}

export const limitSettings: LimitSettings = {
	arrayMaxItems: 100,
	stringMaxLength: 1024,
	numberMinimum: 1,
	numberMaximum: 10000,
	maxPageSize: 1000,
	maxDataReturns: 100,
	maxFileLength: 100 * 1024 * 1024,
	passwordMinLength: 8,
	passwordMaxLength: 100,
};
