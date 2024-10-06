import type { ChatMessage } from "@/utils/types/chat";

export function isChatMessageArray(value: unknown): value is ChatMessage[] {
	if (!Array.isArray(value)) {
		return false;
	}
	return value.every(
		(item) =>
			typeof item === "object" &&
			item !== null &&
			(item.role === "user" || item.role === "assistant") &&
			typeof item.content === "string"
	);
}
