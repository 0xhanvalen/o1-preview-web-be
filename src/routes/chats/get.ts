import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";

const getChatSchema = z.object({
	chatId: z.string(),
});

export const post = [
	validateSchema(getChatSchema),
	async (req: Request, res: Response) => {
		try {
			const { chatId } = req.body;
			const chat = await prisma.chat.findFirst({
				where: { id: chatId },
			});
			if (!chat) {
				return res.status(404).json({ error: "Chat not found", result: null });
			}
			return res.status(200).json({ error: null, result: chat });
		} catch (error) {
			console.error(error);
			return res
				.status(500)
				.json({ error: "Internal Server Error", result: null });
		}
	},
];
