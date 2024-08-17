import { useDecorators } from "@vermi/core";

export const Publish = (event: string) => {
	return useDecorators((target: any, key: string | symbol) => {
		// TODO: Implement
	});
};
