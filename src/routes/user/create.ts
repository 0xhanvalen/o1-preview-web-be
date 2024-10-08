import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";
import { generateTokens } from "@/lib/utils/Token";

const createUserSchema = z.object({
	email: z.string(),
	password: z.string(),
});

export const post = [
	validateSchema(createUserSchema),
	async (req: Request, res: Response) => {
		try {
			const passwordHash = await argon2.hash(req.body.password);
			const createdUser = await prisma.user.create({
				data: {
					email: req.body.email,
					passwordHash,
				},
			});

			if (createdUser) {
				const tokens = generateTokens(createdUser.id);
				const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;
				// Set tokens as HttpOnly cookies
				res.cookie("httpToken", tokens.httpToken, {
					httpOnly: true,
					secure: true, // Set to true if using HTTPS
					maxAge: SEVEN_DAYS, // 1 hour in milliseconds
				});

				res.cookie("wsToken", tokens.wsToken, {
					httpOnly: true,
					secure: true,
					maxAge: SEVEN_DAYS,
				});
				return res.status(200).json({ error: null, result: createdUser });
			}
		} catch (error) {
			console.log({ error });
			return res
				.status(500)
				.json({ error: "Failed to Create User ", result: null });
		}
	},
];
