import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import authenticateRequest from "@/middlewares/authenticateRequest";

export const get = [
	authenticateRequest(),
	async (req: Request, res: Response) => {
		const userId = req.userId;
		if (!userId) {
			return res.status(401).json({ error: "Not Valid User", result: null });
		}
		const projects = await prisma.project.findMany({
			where: {
				authorId: userId,
			},
		});
		return res.status(200).json({ results: projects, error: null });
	},
];
