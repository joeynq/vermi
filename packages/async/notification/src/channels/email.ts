import type { Dictionary } from "@vermi/utils";
import { type Transporter, createTransport } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { NotificationAdapter } from "../interfaces";

export default class EmailAdapter
	implements NotificationAdapter<Mail.Options & Dictionary>
{
	#mailer: Transporter;
	constructor(config: string | SMTPTransport | SMTPTransport.Options) {
		this.#mailer = createTransport(config);
	}

	async send(options: Mail.Options & { content: string }) {
		await this.#mailer.sendMail({
			...options,
			html: options.content,
		});
	}
}
