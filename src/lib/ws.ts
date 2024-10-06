import { OPEN, Server, type WebSocket } from "ws";
import { User, Chat } from "@prisma/client";
import { verifyToken } from "./utils/Token";
import prisma from "./prisma";

const connectedUsers = new Map<string, { clients: WebSocket[]; user: User }>();

export const list_users = () => {
	const userArray = Array.from(connectedUsers.values()).map(({ user }) => user);
	return userArray;
};

export const WSS = new Server({ noServer: true });

WSS.on("connection", async (ws, request) => {
	if (!request.url) {
		console.error("Error: No URL in WSS Request");
		return;
	}
	const token = request.url.split("?token=")[1];

	if (!token) {
		console.error("Error: no WSS Token");
		ws.close();
		return;
	}

	const userId = verifyToken(token, "ws");
	if (!userId) {
		console.error("Error: non-valid User attempting WS");
		ws.close();
		return;
	}

	console.log(`[websocket]: ${userId} connected`);

	ws.on("close", () => {
		console.log(`[websocket]: ${userId} disconnected`);
		const oldUser = connectedUsers.get(`${userId}`);
		if (oldUser) {
			connectedUsers.set(`${userId}`, {
				clients: oldUser.clients.filter((client) => client !== ws) || [],
				user: oldUser.user,
			});
		}
	});

	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		console.error("Error: non-existent User attempting WS");
		ws.close();
		return;
	}

	connectedUsers.set(`${userId}`, {
		clients: [...(connectedUsers.get(`${userId}`)?.clients || []), ws],
		user,
	});
});

type WsMessageArgs = {
	message?: string;
	type?: string;
	messageStreamId?: string;
	chunk?: string;
	chat?: Chat;
	chatId: string;
};

export function sendMessageToUser({
	userId,
	args,
}: {
	userId: string;
	args: WsMessageArgs;
}) {
	connectedUsers.get(`${userId}`)?.clients.forEach((clientWs) => {
		if (clientWs.readyState === OPEN) {
			clientWs.send(JSON.stringify(args));
		}
	});
}
