import type { ChatMessage } from "@/utils/types/chat";

export function countMessageTokens(message: ChatMessage): number {
	const chatMessageString = JSON.stringify(message);
	const tokens = chatMessageString.length / 4;
	return Math.ceil(tokens);
}
