import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/utils/env";

/**
 * Generates an http and ws token for a user identified by ID
 * @param userId
 * @returns {httpToken, wsToken}
 */
export function generateTokens(userId: number) {
	const httpToken = jwt.sign({ userId }, JWT_SECRET, {
		expiresIn: "30d",
	});

	const wsToken = jwt.sign({ wsUserId: userId }, JWT_SECRET, {
		expiresIn: "30d",
	});

	return {
		httpToken,
		wsToken,
	};
}

export function verifyToken(token: string, type: "http" | "ws" = "http") {
	let userId = null;

	try {
		let payload = jwt.verify(token, JWT_SECRET);

		switch (type) {
			case "http":
				userId = (payload as { userId: number }).userId || null;
				break;
			case "ws":
				userId = (payload as { wsUserId: number }).wsUserId || null;
				break;
			default:
				throw "Invalid Type";
				break;
		}
		if (typeof userId !== null) {
			return userId;
		} else {
			throw "No User Id";
		}
	} catch (error) {
		console.error("Error: Unable to Verify Token", error as Error);
		return null;
	}
}
