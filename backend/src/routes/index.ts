import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AuthType } from "@/utils/auth.utils.js";
import authRouter from "./auth.route.js";
import categoryRouter from "./category.route.js";
import savingGoalsRouter from "./savingGoals.route.js";
import transactionRouter from "./transactions.route.js";
import userSettingsRouter from "./userSettings.route.js";
import userRouter from "./users.route.js";

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

const routers = [
	authRouter,
	userRouter,
	categoryRouter,
	userSettingsRouter,
	transactionRouter,
	savingGoalsRouter,
];

routers.forEach((route) => {
	router.basePath("/api").route(route.path, route.handler);
});

export type RouterType = (typeof routers)[number];
export default router;
