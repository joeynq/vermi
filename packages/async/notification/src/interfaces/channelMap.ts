import type SMTPTransport from "nodemailer/lib/smtp-transport";

export type AdapterConfigMap = {
	email: string | SMTPTransport | SMTPTransport.Options;
};
