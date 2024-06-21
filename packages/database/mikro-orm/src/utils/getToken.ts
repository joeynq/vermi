export const MikroOrmModuleKey = "mikro-orm";

export const getToken = (contextName = "default") => {
	return `${MikroOrmModuleKey.toString()}.${contextName}`;
};
