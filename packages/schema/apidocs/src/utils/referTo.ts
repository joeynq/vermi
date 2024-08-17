import { type TRef, type TSchema, Type } from "@sinclair/typebox";

export const referTo = (components: string, paths: string[]) => {
	return paths.reduce(
		(acc, path) => {
			acc[path] = Type.Ref(`#/components/${components}/${path}`);
			return acc;
		},
		{} as Record<string, TRef<TSchema>>,
	);
};
