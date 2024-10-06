import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import authenticateRequest from "@/middlewares/authenticateRequest";
import { z } from "zod";
import { validateSchema } from "@/middlewares/validateSchema";

const createProjectSchema = z.object({
	name: z.string(),
});

export const post = [
	authenticateRequest(),
	validateSchema(createProjectSchema),
	async (req: Request, res: Response) => {
		try {
			const userId = req.userId;
			if (!userId) {
				return res.status(401).json({ error: "Not Valid User", result: null });
			}
			const newProject = await prisma.project.create({
				data: {
					authorId: userId,
					name: req.body.name,
				},
			});
			if (newProject) {
				return res.status(200).json({
					error: null,
					result: newProject,
				});
			}
		} catch (error) {
			return res
				.status(500)
				.json({ error: "Failed to Create Project ", result: null });
		}
	},
];
