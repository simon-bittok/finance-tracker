import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import routes from "@routes/index.js";

const app = new Hono();

app.use(logger());

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
