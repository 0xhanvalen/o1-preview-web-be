import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { z } from "zod";
import authenticateRequest from "@/middlewares/authenticateRequest";
import { validateSchema } from "@/middlewares/validateSchema";
import argon2 from "argon2";
import crypto from "crypto";
import { JWT_SECRET } from "@/utils/env";
import type { SecuredKey } from "@/utils/types/security";

const UpdateUserSchema = z.object({
	password: z.string().optional(),
	apiKey: z.string().optional(),
});

export const post = [
	authenticateRequest(),
	validateSchema(UpdateUserSchema),
	async (req: Request, res: Response) => {
		try {
			const { password, apiKey } = req.body;
			const userId = req.userId;
			if (!password && !apiKey) {
				return res.status(400).json({ error: "No fields to update" });
			}
			if (password) {
				const passwordHash = await argon2.hash(password);
				await prisma.user.update({
					where: {
						id: userId,
					},
					data: {
						passwordHash,
					},
				});
			}
			if (apiKey) {
				const iv = crypto.randomBytes(16);
				const cipher = crypto.createCipheriv(
					"aes-256-cbc",
					crypto.scryptSync(JWT_SECRET, "salt", 32),
					iv
				);
				let encrypted = cipher.update(apiKey, "utf8", "hex");
				encrypted += cipher.final("hex");
				const openAIKey: SecuredKey = {
					iv: iv.toString("hex"),
					encrypted,
				};
				console.log({ openAIKey });
				await prisma.user.update({
					where: {
						id: userId,
					},
					data: {
						openAIKey,
					},
				});
			}
			return res.status(200).json({ error: null, result: "User updated" });
		} catch (error) {
			console.error("Error updating user", error);
			return res
				.status(500)
				.json({ error: "Internal Server Error", result: null });
		}
	},
];
