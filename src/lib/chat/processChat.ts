import prisma from "@/lib/prisma";
import OpenAI from "openai";
import { ChatMessage } from "@/utils/types/chat";
import { isChatMessageArray } from "./helpers/chatMessageArray";
import { cullChatHistory } from "./helpers/cullChatHistory";
import { getKey } from "@/lib/security/decryptKey";

const MAX_INPUT_TOKENS = 100_000; // reserve 32k for reasoning and output

export async function processChat(args: { chatId: string; authorId: number }) {
	try {
		// get openai key
		const apiKey = await getKey({ userId: args.authorId });
		if (!apiKey) {
			throw new Error("OpenAI Key not found");
		}
		// fetch chat
		const chat = await prisma.chat.findUnique({
			where: { id: args.chatId, authorId: args.authorId },
		});
		// validate chat
		if (!chat) {
			throw new Error("Chat not found");
		}
		if (!isChatMessageArray(chat.chatHistory)) {
			throw new Error("Chat history is not chats");
		}
		// prepare chat
		const openai = new OpenAI({
			apiKey,
		});
		const chatHistory = chat.chatHistory;
		const culledChatHistory = cullChatHistory(chatHistory, MAX_INPUT_TOKENS);
		const response = await openai.chat.completions.create({
			model: "o1-preview",
			messages: culledChatHistory,
		});
		if (response.choices[0].message.content === null) {
			throw new Error("OpenAI did not respond");
		}
		const assistantMessage: ChatMessage = {
			role: "assistant",
			content: response.choices[0].message.content,
		};
		chatHistory.push(assistantMessage);
		// prepare usage data
		const usage = response.usage;
		let inputTokens = usage?.prompt_tokens || 0;
		let outputTokens = usage?.completion_tokens || 0;
		let reasoningTokens =
			usage?.completion_tokens_details?.reasoning_tokens || 0;
		inputTokens += chat.totalInputTokens;
		outputTokens += chat.totalOutputTokens;
		reasoningTokens += chat.totalReasoningTokens;
		// update chat
		const updatedChat = await prisma.chat.update({
			where: {
				id: args.chatId,
			},
			data: {
				totalInputTokens: inputTokens,
				totalOutputTokens: outputTokens,
				totalReasoningTokens: reasoningTokens,
				chatHistory,
			},
		});
		return updatedChat;
	} catch (error) {
		console.error(`processChat Failed for chatId ${args.chatId}:`, error);
		throw error;
	}
}
