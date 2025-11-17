import { Hono } from "hono";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import type { AuthType } from "@/utils/auth.utils.js";

const app = new Hono<{ Bindings: AuthType }>({
	strict: false,
});

app.get("/me", requireAuth, async (c) => {
	const user = c.get("user");

	return c.json(user);
});

const router = {
	path: "/users",
	handler: app,
};

export default router;
