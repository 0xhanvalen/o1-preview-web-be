import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import authenticateRequest from "@/middlewares/authenticateRequest";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";
import type { ChatMessage } from "@/utils/types/chat";
import { processChat } from "@/lib/chat/processChat";

const updateChatSchema = z.object({
	message: z.string(),
	chatId: z.string(),
});

type ChatHistory = ChatMessage[];

export const post = [
	authenticateRequest(),
	validateSchema(updateChatSchema),
	async (req: Request, res: Response) => {
		try {
			const { chatId, message } = req.body;
			const chat = await prisma.chat.findFirst({
				where: { id: chatId },
			});

			if (!chat) {
				return res.status(404).json({ error: "Chat not found", result: null });
			}
			// add the new message to chat history
			const chatHistory = chat.chatHistory as ChatHistory;
			chatHistory.push({
				role: "user",
				content: message,
			});
			await prisma.chat.update({
				where: { id: chatId },
				data: {
					chatHistory,
				},
			});

			// start processing the chat after updating the history
			await processChat({ chatId: chat.id, authorId: 1 });
			// fetch the updated chat
			const updatedChat = await prisma.chat.findFirst({
				where: { id: chatId },
			});
			// give it back
			return res.status(200).json({ error: null, result: updatedChat });
		} catch (error) {
			console.error(error);
			return res
				.status(500)
				.json({ error: "Internal Server Error", result: null });
		}
	},
];
