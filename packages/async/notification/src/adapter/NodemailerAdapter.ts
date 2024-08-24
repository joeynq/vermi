import { type Transporter } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { NotificationAdapter } from "../interfaces";

export default class EmailAdapter extends NotificationAdapter<
	Transporter,
	Mail.Options
> {
	async send(content: string, options: Mail.Options) {
		await this.provider.sendMail({
			...options,
			html: content,
		});
	}
}
