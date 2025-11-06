import { auth } from "@/utils/auth.js";
import type { Session, User } from "better-auth/types";
import { createMiddleware } from "hono/factory";

type AuthVariable = {
	user: User;
	session: Session;
};

export const requireAuth = createMiddleware<{ Variables: AuthVariable }>(
	async (c, next) => {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session) {
			return c.json(
				{
					error: "Unauthorised. Please login to continue.",
				},
				401,
			);
		}

		c.set("user", session.user);
		c.set("session", session.session);

		await next();
	},
);
