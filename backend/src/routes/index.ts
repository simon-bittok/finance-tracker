import type { AuthType } from "@/utils/auth.js";
import { Hono } from "hono";
import authRouter from "./auth.js";
import userRouter from "./users.js";
import { cors } from "hono/cors";

const router = new Hono<{ Bindings: AuthType }>({ strict: false });

router.use(
	"/*",
	cors({
		origin: ["http://localhost:3000"],
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "DELETE", "PUT", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

const routers = [authRouter, userRouter];

routers.forEach((route) => {
	router.basePath("/api").route(route.path, route.handler);
});

export default router;
