import { Request, Response } from "express";
import authenticateRequest from "@/middlewares/authenticateRequest";

export const get = [
	// authenticateRequest(),
	async (req: Request, res: Response) => {
		res.clearCookie("httpToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // set to true in production
			path: "/", // make sure the path is correct
		});

		res.clearCookie("wsToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
		});

		// Optionally send a response message
		res.status(200).json({ message: "Logged out successfully" });
	},
];
