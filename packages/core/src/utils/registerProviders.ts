import { type Class, camelCase, mapToRecords } from "@vermi/utils";
import { type BuildResolver, RESOLVER, asClass } from "awilix";
import { containerRef } from "../services";
import { dependentStore } from "../store";

const getResolvers = (services: Class<any>[]) => {
	const registering: Map<string, BuildResolver<any>> = new Map();

	const dependentServices = dependentStore.combine(...services);
	if (dependentServices?.length) {
		const dependentResolvers = getResolvers(dependentServices);
		for (const [key, value] of dependentResolvers.entries()) {
			if (registering.has(camelCase(key))) {
				continue;
			}
			registering.set(camelCase(key), value);
		}
	}
	for (const serviceClass of services) {
		// @ts-ignore
		const registeringName = serviceClass[RESOLVER].name || serviceClass.name;
		registering.set(camelCase(registeringName), asClass(serviceClass));
	}

	return registering;
};

export function registerProviders(...providers: Class<any>[]) {
	if (!providers.length) {
		return {};
	}
	const container = containerRef();
	const resolvers = mapToRecords(getResolvers(providers));
	container.register(resolvers);
}
