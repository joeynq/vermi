import { type TSchema, Type } from "@sinclair/typebox";
import { getSchemas } from "@vermi/schema";
import { camelCase } from "@vermi/utils";
import { WsException, getWsEvents } from "@vermi/ws";
import type { AsyncAPIConfig } from "../interfaces";
import type {
	AsyncAPIObject,
	ChannelObject,
	SecuritySchemeObject,
} from "../interfaces/AsyncAPI";
import { removeUnused } from "../utils";
import { BaseAPIService, type BuildSpecsOptions } from "./BaseAPIService";

export class AsyncAPIService extends BaseAPIService<AsyncAPIConfig> {
	protected defaultSpecs: AsyncAPIObject = {
		asyncapi: "3.0.0",
		info: {
			title: "Vermi API",
			version: "1.0.0",
		},
		components: {},
	};

	#specs: AsyncAPIObject = this.defaultSpecs;

	constructor(public config: AsyncAPIConfig) {
		super(config);
	}

	#addSchemas(schemas: TSchema[]) {
		this.#specs.components = this.#specs.components ?? {};
		this.#specs.components.schemas = this.#specs.components.schemas ?? {};

		for (const schema of schemas) {
			if (!schema.$id) continue;
			const name = schema.$id.split("/").pop();
			this.#specs.components.schemas[String(name)] = schema;
		}
	}

	#addMessage(name: string, schema?: TSchema) {
		this.#specs.components = this.#specs.components ?? {};
		this.#specs.components.messages = this.#specs.components.messages ?? {};

		if (!schema) {
			this.#specs.components.messages[name] = {};
			return;
		}
		this.#specs.components.messages[name] = {
			payload: Type.Ref(schema),
		};
	}

	addSecuritySchemes(scheme: Record<string, SecuritySchemeObject>) {
		for (const [key, value] of Object.entries(scheme)) {
			// this.#builder.addSecurityScheme(key, value);
		}
	}

	async buildSpecs({ serverUrl, title, casing }: BuildSpecsOptions) {
		this.chooseCasing(casing);

		const events = getWsEvents();
		this.#specs = this.mergeSpecs();

		const specs = this.#specs;

		const unfiltered = getSchemas().filter((schema) => schema.$id);
		const schemas = [
			...new Map(unfiltered.map((pos) => [pos.$id, pos])).values(),
		];

		this.#addSchemas(
			[...schemas, WsException.schema].map((s) => this.changeCase(s)),
		);

		specs.info.title = title;
		specs.servers = {};

		specs.channels = specs.channels ?? {};
		specs.operations = specs.operations ?? {};

		for (const [channel, messages] of events) {
			const channelObject: ChannelObject = { messages: {} };
			const channelName = camelCase(channel) || "root";
			for (const message of messages) {
				const { event, args, handlerId, prefix } = message;

				const serverName = camelCase(prefix);
				const address = channel.replace(prefix, "");
				if (!specs.servers[serverName]) {
					specs.servers[serverName] = {
						host: new URL(serverUrl).host,
						pathname: prefix,
						protocol: "ws",
					};
				}

				channelObject.address = address;
				specs.operations[camelCase(handlerId)] = {
					action: "receive",
					channel: { $ref: `#/channels/${channelName}` },
				};

				this.#addSchemas(args.map((arg) => arg.schema));
				this.#addMessage(event, args[0]?.schema);
				(channelObject.messages as any)[event] = {
					$ref: `#/components/messages/${event}`,
				};
			}
			specs.channels[channelName] = channelObject;
		}

		return removeUnused(specs);
	}
}
