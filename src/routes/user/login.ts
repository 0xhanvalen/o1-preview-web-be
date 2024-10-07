import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";
import { generateTokens } from "@/lib/utils/Token";
import dotenv from "dotenv";
dotenv.config();

const loginSchema = z.object({
	email: z.string(),
	password: z.string(),
});

export const post = [
	validateSchema(loginSchema),
	async (req: Request, res: Response) => {
		try {
			console.log("Logging In...");
			const { email, password } = req.body;
			console.log({ email, password });
			// find user by email before checking password
			const user = await prisma.user.findFirst({
				where: {
					email: { equals: email, mode: "insensitive" },
				},
			});
			if (!user) {
				return res
					.status(404)
					.json({ error: "Failed to find User", result: null });
			}
			// compare hashed passwords
			const passwordsMatch: boolean = await argon2.verify(
				user.passwordHash,
				req.body.password
			);
			if (!passwordsMatch) {
				return res.status(401).json({
					error: "Incorrect password",
					result: null,
				});
			}
			// send the tokens
			const tokens = generateTokens(user.id);
			const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;
			// Set tokens as HttpOnly cookies
			res.cookie("httpToken", tokens.httpToken, {
				httpOnly: true,
				secure: process.env.ENVIRONMENT === "production",
				sameSite: process.env.ENVIRONMENT === "production" ? "strict" : "lax",
				maxAge: SEVEN_DAYS, // 1 hour in milliseconds
			});

			res.cookie("wsToken", tokens.wsToken, {
				httpOnly: true,
				secure: process.env.ENVIRONMENT === "production",
				sameSite: process.env.ENVIRONMENT === "production" ? "strict" : "lax",
				maxAge: SEVEN_DAYS,
			});
			console.log("Logged In!");
			return res.status(200).json({ error: null, result: "Logged In!" });
		} catch (error) {
			return res.status(500).json({ error: "Failed to Log In ", result: null });
		}
	},
];
