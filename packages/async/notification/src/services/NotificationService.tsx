import { render } from "@react-email/render";
import { Config, Injectable } from "@vermi/core";
import type { FC } from "react";
import type { AdapterConfigMap, SendWithTemplateOptions } from "../interfaces";

interface NotificationServiceOptions {
	channels: Partial<AdapterConfigMap>;
	templates: Record<string, FC>;
}

@Injectable("SINGLETON")
export class NotificationService {
	#worker: Worker;

	@Config("NotificationModule")
	config!: NotificationServiceOptions;

	constructor() {
		this.#worker = this.#createWorker();
	}

	#createWorker() {
		const url = new URL("./NotificationWorker", import.meta.url).href;
		return new Worker(url);
	}

	#compileTemplate(template: string, data: any) {
		const Template = this.config.templates[template];
		return render(<Template {...data} />);
	}

	onMessage(callback: (message: any) => void) {
		this.#worker.addEventListener("message", (event) => {
			callback(event.data);
		});
	}

	onError(callback: (error: string) => void) {
		this.#worker.addEventListener("error", (event) => {
			callback(event.message);
		});
	}

	unmount() {
		this.#worker.terminate();
	}

	send<C extends keyof AdapterConfigMap>(options: SendWithTemplateOptions<C>) {
		const content = this.#compileTemplate(options.template, options.data);

		this.#worker.postMessage({
			config: this.config.channels[options.channel],
			// @ts-ignore
			sendOptions: { ...options, content },
		});
	}
}
