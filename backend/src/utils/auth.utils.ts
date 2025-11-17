import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.utils.js";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "sqlite",
	}),
	// Frontend
	trustedOrigins: [
		"http://127.0.0.1:3000",
		"moz-extension://8c7e0437-ba66-4414-b617-708aa4289a0f",
	],
	emailAndPassword: {
		enabled: true,
	},
});

export type AuthType = {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
};
