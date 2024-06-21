export const rateLimitSchemas = {
	limit: {
		description:
			"The maximum number of requests that the consumer is permitted to make in a given period.",
		schema: {
			type: "integer",
			format: "int32",
			minimum: 1,
			maximum: 10000,
		},
	},
	remaining: {
		description:
			"The number of requests remaining in the current rate limit window.",
		schema: {
			type: "integer",
			format: "int32",
			minimum: 0,
			maximum: 10000,
		},
	},
	reset: {
		description:
			"The time at which the current rate limit window resets in UTC epoch seconds.",
		schema: {
			type: "integer",
			format: "int32",
			minimum: 0,
			maximum: 9999999999999,
		},
	},
	retryAfter: {
		description:
			"The number of seconds until the consumer can make another request.",
		schema: {
			type: "integer",
			format: "int32",
			minimum: 0,
			maximum: 9999999999999,
		},
	},
} as const;

export const corsSchema = {
	description:
		"Indicates whether the response can be shared with requesting code from the given origin.",
	schema: {
		type: "string",
		maxLength: 255,
		minLength: 1,
		pattern: "^(\\*|[a-zA-Z0-9]+)$",
	},
} as const;
