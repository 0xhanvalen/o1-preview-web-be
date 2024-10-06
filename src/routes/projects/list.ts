import type { Request, Response } from "express";
import prisma from "@/lib/prisma";

export const get = [
	// authenticateRequest(),
	async (req: Request, res: Response) => {
		const projects = await prisma.project.findMany({
			where: {
				authorId: 1,
			},
		});
		return res.status(200).json({ results: projects, error: null });
	},
];
