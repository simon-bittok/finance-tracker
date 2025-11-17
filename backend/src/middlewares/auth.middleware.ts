import type { Session, User } from "better-auth/types";
import { createMiddleware } from "hono/factory";
import { auth } from "@/utils/auth.utils.js";

type AuthVariable = {
	user: User;
	session: Session;
  userId: string;
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
    c.set("userId", session.user.id);

		await next();
	},
);
