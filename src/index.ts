import { PORT, init } from "@/utils/env";
init();
import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { WSS } from "./lib/ws";
import http from "http";
import createRouter from "express-file-routing";

(async () => {
	const app: Express = express();
	const port = PORT || 3001;

	app.use(
		cors({
			origin: "http://localhost:3000", // replace with your frontend origin
			credentials: true, // allow credentials
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
		console.log(`[server]: Server is running at http://localhost:${port}`);
	});
})();
