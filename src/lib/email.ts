import nodemailer from "nodemailer";

import { APP_PASSWORD, APP_EMAIL } from "@/utils/env";

export const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: APP_EMAIL,
		pass: APP_PASSWORD,
	},
});
