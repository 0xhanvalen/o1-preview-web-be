import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import authenticateRequest from "@/middlewares/authenticateRequest";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";
import type { ChatMessage } from "@/utils/types/chat";
import { processChat } from "@/lib/chat/processChat";

const createChatSchema = z.object({
	message: z.string(),
	projectId: z.number(),
	title: z.string().optional(),
});

export const post = [
	authenticateRequest(),
	validateSchema(createChatSchema),
	async (req: Request, res: Response) => {
		try {
			const { projectId, message, title } = req.body;
			const userId = req.userId;
			if (!userId) {
				return res.status(401).json({ error: "Not Valid User", result: null });
			}
			// Ensure project exists and belongs to the user
			const project = await prisma.project.findFirst({
				where: { id: projectId, authorId: userId },
			});
			if (!project) {
				return res
					.status(404)
					.json({ error: "Project not found or access denied", result: null });
			}
			// Initialize chat history
			const initialChatHistory: ChatMessage[] = [
				{
					role: "user",
					content: message,
				},
			];
			// Create the chat
			const chat = await prisma.chat.create({
				data: {
					authorId: userId,
					projectId,
					title: title ?? "Untitled Chat",
					chatHistory: initialChatHistory,
					totalInputTokens: 0,
					totalOutputTokens: 0,
					totalReasoningTokens: 0,
				},
			});
			// immediately start generating chat asynchronously
			processChat({ chatId: chat.id, authorId: userId });
			// Return created chat
			return res.status(201).json({ error: null, result: chat });
		} catch (error) {
			console.error(error);
			return res
				.status(500)
				.json({ error: "Failed to Create Chat", result: null });
		}
	},
];
