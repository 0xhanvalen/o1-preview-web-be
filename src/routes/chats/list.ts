import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";

const listChatSchema = z.object({
	projectId: z.number(),
});

export const post = [
	// authenticateRequest(),
	validateSchema(listChatSchema),
	async (req: Request, res: Response) => {
		const { projectId } = req.body;
		const projects = await prisma.chat.findMany({
			where: {
				authorId: 1,
				projectId,
			},
		});
		return res.status(200).json({ results: projects, error: null });
	},
];
