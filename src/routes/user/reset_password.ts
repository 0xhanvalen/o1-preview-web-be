import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";
import { JWT_SECRET } from "@/utils/env";
import jwt from "jsonwebtoken";
import { transporter } from "@/lib/email";
import argon2 from "argon2";

const resetPasswordSchema = z.object({
	token: z.string(),
	password: z.string(),
});

export const post = [
	validateSchema(resetPasswordSchema),
	async (req: Request, res: Response) => {
		// Find the password reset token
		const passwordReset = await prisma.passwordResets.findFirst({
			where: {
				token: req.body.token,
			},
		});
		// Check if the token exists
		if (!passwordReset) {
			return res.status(404).json({ error: "Token not found" });
		}
		// Decode the token
		const decoded = jwt.verify(req.body.token, JWT_SECRET);
		const userId = (decoded as { userId: number }).userId;
		// hash password
		const hashedPassword = await argon2.hash(req.body.password);
		// Update the user's password
		await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				passwordHash: hashedPassword,
			},
		});
		// Delete the password reset token
		await prisma.passwordResets.delete({
			where: {
				id: passwordReset.id,
			},
		});

		// Respond with success
		res.json({ message: "Password reset successfully" });
	},
];
