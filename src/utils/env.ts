import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT + "";
export const JWT_SECRET = process.env.JWT_SECRET + "";
export const APP_PASSWORD = process.env.APP_PASSWORD + "";
export const APP_EMAIL = process.env.APP_EMAIL + "";
export const URL = process.env.URL + "";

export function init() {
	if (PORT.length === 0) throw new Error("PORT is not set");
	if (JWT_SECRET.length === 0) throw new Error("JWT_SECRET is not set");
	if (APP_PASSWORD.length === 0) throw new Error("APP_PASSWORD is not set");
	if (APP_EMAIL.length === 0) throw new Error("APP_EMAIL is not set");
	if (URL.length === 0) throw new Error("URL is not set");
}
