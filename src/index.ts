import { PORT, init } from "@/utils/env";
init();
import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { WSS } from "./lib/ws";
import http from "http";
import createRouter from "express-file-routing";
import dotenv from "dotenv";
dotenv.config();

(async () => {
	const app: Express = express();
	const port = PORT || 3001;

	const origin =
		process.env.ENVIRONMENT === "production"
			? "https://o1-playground.mackenziebowes.com"
			: "http://localhost:3000";
	app.use(
		cors({
			origin,
			credentials: true,
		})
	);
	app.use(express.json());
	app.use(cookieParser());

	await createRouter(app);

	app.use((err: any, req: any, res: any, next: any) => {
		console.log(err);
		res.status(500).json({ error: err.message });
	});

	const server = http.createServer(app);

	server.on("upgrade", async (request, socket, head) => {
		const token = request.url?.split("?token=").at(-1);

		if (!token) {
			socket.destroy();
			return;
		}

		WSS.handleUpgrade(request, socket, head, (ws) => {
			WSS.emit("connection", ws, request);
		});
	});

	server.listen(port, () => {
		console.log({ ENVIRONMENT: process.env.ENVIRONMENT });
		console.log(`[server]: Server is running at ${port}`);
	});
})();
