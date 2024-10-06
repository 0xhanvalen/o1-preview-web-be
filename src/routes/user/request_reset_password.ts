import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";
import { JWT_SECRET } from "@/utils/env";
import jwt from "jsonwebtoken";
import { transporter } from "@/lib/email";
import { APP_EMAIL } from "@/utils/env";

const resetPasswordSchema = z.object({
	email: z.string().email(),
});

export const post = [
	validateSchema(resetPasswordSchema),
	async (req: Request, res: Response) => {
		// Check if user exists
		const user = await prisma.user.findFirst({
			where: {
				email: req.body.email,
			},
		});
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		// Generate a reset token
		const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
			expiresIn: "1h",
		});
		// add reset token to prisma
		await prisma.passwordResets.create({
			data: {
				token: resetToken,
				email: user.email,
			},
		});

		// Send reset token to user's email
		const mailOptions = {
			from: `"Mackenzie's o1 Playground" <${APP_EMAIL}>`,
			to: user.email,
			subject: "Password Reset Request",
			html: `
			  <p>You requested a password reset.</p>
			  <p>Click the link below to reset your password:</p>
			  <a href="http://localhost:3000/reset-password/${resetToken}">Reset Password</a>
			  <p>If you didn't request this, please ignore this email.</p>
			`,
		};
		try {
			// Send the email
			await transporter.sendMail(mailOptions);
			console.log(`Password reset email sent to ${user.email}`);
		} catch (error) {
			console.error("Error sending password reset email:", error);
			throw error; // Rethrow the error to be handled by the calling function
		}
	},
];
