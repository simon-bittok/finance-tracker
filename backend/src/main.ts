import routes from "@routes/index.js";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { pinoLogger } from "hono-pino";
import pino from "pino";
import type { DebugLogOptions } from "hono-pino/debug-log";

const app = new Hono();

const options: DebugLogOptions = {
	colorEnabled: true,
};

app.use(
	pinoLogger({
		pino: pino({
			base: null,
			level: "debug",
			transport: {
				target: "hono-pino/debug-log",
				options,
			},
			timestamp: pino.stdTimeFunctions.unixTime,
		}),
	}),
);

app.notFound((c) => {
	const pathname = c.req.path;

	return c.json(
		{
			error: `Page ${pathname} not found`,
		},
		404,
	);
});

app.onError((error, c) => {
	if (error instanceof HTTPException) {
		return c.json(
			{
				error: error.message,
			},
			error.status,
		);
	}

	return c.json({ error: "Internal Server Error" }, 500);
});

app.route("/", routes);

export default app;
