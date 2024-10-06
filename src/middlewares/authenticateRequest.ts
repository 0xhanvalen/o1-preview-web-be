import { NextFunction, Request, Response } from "express";
import { verifyToken } from "@/lib/utils/Token";

export default (
		{
			noRedirect,
		}: {
			noRedirect?: boolean;
		} = {
			noRedirect: false,
		}
	) =>
	async (req: Request, res: Response, next: NextFunction) => {
		console.log("Authenticating Request...");
		const cookies = req.cookies;
		console.log({ cookies });
		const httpToken = req.cookies["httpToken"];

		if (httpToken) {
			const userId = verifyToken(httpToken, "http");
			console.log({ userId });
			if (userId) {
				req.userId = userId;
			}
		}

		if (!req.userId && !noRedirect) {
			console.error("Error: Not Signed In");
			return res.status(401).json({ error: "Not Signed In", results: null });
		}

		next();
	};
