import { Hono } from "hono";
import { auth, type AuthType } from "@/utils/auth.utils.js";

const app = new Hono<{ Bindings: AuthType }>({
	strict: false,
});

app.on(["GET", "POST"], "/*", (c) => {
	return auth.handler(c.req.raw);
});

const router = {
	path: "/auth",
	handler: app,
};

export default router;
