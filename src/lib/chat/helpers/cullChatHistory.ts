import type { ChatMessage } from "@/utils/types/chat";
import { countMessageTokens } from "./countMessageTokens";
export function cullChatHistory(
	chatHistory: ChatMessage[],
	maxInputTokens: number
): ChatMessage[] {
	let totalTokens = 0;
	const culledChatHistory: ChatMessage[] = [];
	// Start from the latest messages and work backwards
	for (let i = chatHistory.length - 1; i >= 0; i--) {
		const message = chatHistory[i];
		const messageTokens = countMessageTokens(message);
		if (totalTokens + messageTokens > maxInputTokens) {
			break; // Stop adding more messages if we've reached the limit
		}
		// Add the message to the beginning since we're iterating backwards
		culledChatHistory.unshift(message);
		totalTokens += messageTokens;
	}
	return culledChatHistory;
}
