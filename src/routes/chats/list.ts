import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";
import authenticateRequest from "@/middlewares/authenticateRequest";

const listChatSchema = z.object({
	projectId: z.number(),
});

export const post = [
	authenticateRequest(),
	validateSchema(listChatSchema),
	async (req: Request, res: Response) => {
		const { projectId } = req.body;
		const userId = req.userId;
		if (!userId) {
			return res.status(401).json({ error: "Not Valid User", result: null });
		}
		const projects = await prisma.chat.findMany({
			where: {
				authorId: userId,
				projectId,
			},
		});
		return res.status(200).json({ results: projects, error: null });
	},
];
