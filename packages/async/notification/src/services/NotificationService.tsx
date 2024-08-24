import { render } from "@react-email/render";
import { Config, Injectable } from "@vermi/core";
import type { FC } from "react";
import type { NotificationModuleConfig } from "../nofitication";

// interface NotificationServiceOptions {
// 	channels: Partial<AdapterConfigMap>;
// 	templates: Record<string, FC>;
// }

@Injectable("TRANSIENT")
export class NotificationService<
	TemplateMap extends Record<string, Record<string, FC>> = Record<
		string,
		Record<string, FC>
	>,
> {
	@Config("NotificationModule")
	config!: NotificationModuleConfig<any, any>[];

	get templates() {
		return this.config.reduce((acc, { channel, templates }) => {
			// @ts-ignore
			acc[channel] = templates;
			return acc;
		}, {} as TemplateMap);
	}

	#compileTemplate(Template: FC, data: any) {
		return render(<Template {...data} />);
	}

	send<Data>(
		channel: keyof TemplateMap,
		templateName: keyof TemplateMap[keyof TemplateMap],
		data: Data,
	) {
		const template = this.templates[channel][templateName];
		const content = this.#compileTemplate(template, data);

		// const adapter
	}
}
