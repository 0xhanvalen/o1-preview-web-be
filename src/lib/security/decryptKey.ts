import prisma from "../prisma";
import crypto from "crypto";
import type { SecuredKey } from "@/utils/types/security";
import { JWT_SECRET } from "@/utils/env";

export async function getKey(args: { userId: number }) {
	const user = await prisma.user.findFirst({
		where: {
			id: args.userId,
		},
		select: {
			openAIKey: true,
		},
	});
	if (!user) {
		return null;
	}
	const openAIKey: SecuredKey = user.openAIKey as SecuredKey;
	const iv = Buffer.from(openAIKey.iv, "hex");
	const encryptedText = openAIKey.encrypted;
	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		crypto.scryptSync(JWT_SECRET, "salt", 32),
		iv
	);
	let decrypted = decipher.update(encryptedText, "hex", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}
