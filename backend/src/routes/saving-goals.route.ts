import { zValidator } from "@hono/zod-validator";
import * as savingGoalsRepository from "@repository/saving-goals.repository.js";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "@/middlewares/auth.js";
import {
	createSavingGoalSchema,
	goalContribution,
	updateSavingGoalSchema,
} from "@/types/savingGoals.js";
import type { AuthType } from "@/utils/auth.js";
import { prisma } from "@/utils/prisma.js";

const app = new Hono<{ Bindings: AuthType }>({ strict: false });

app.get("/", requireAuth, async (c) => {
	const userId = c.get("userId");
	const savingGoals = await savingGoalsRepository.getAllSavingGoals(
		userId,
		prisma,
	);

	return c.json({
		metadata: {
			total: savingGoals.length,
		},
		data: savingGoals,
	});
});

app.post(
	"/",
	zValidator("json", createSavingGoalSchema),
	requireAuth,
	async (c) => {
		const userId = c.get("userId");
		const params = c.req.valid("json");

		const savingGoal = await savingGoalsRepository.createSavingGoal(
			userId,
			params,
			prisma,
		);

		return c.json(savingGoal, 201);
	},
);

app.patch(
	"/:id",
	zValidator("json", updateSavingGoalSchema),
	requireAuth,
	async (c) => {
		const userId = c.get("userId");
		const id = c.req.param("id");
		const params = c.req.valid("json");

		const savingGoal = await savingGoalsRepository.updateSavingGoal(
			id,
			userId,
			params,
			prisma,
		);

		return c.json(savingGoal, 201);
	},
);

app.get("/:id", requireAuth, async (c) => {
	const userId = c.get("userId");
	const id = c.req.param("id");

	const savingGoal = await savingGoalsRepository.getSavingGoalById(
		id,
		userId,
		prisma,
	);

	if (!savingGoal) {
		throw new HTTPException(404, { message: "Saving goal not found" });
	}

	return c.json(savingGoal);
});

app.delete("/:id", requireAuth, async (c) => {
	const userId = c.get("userId");
	const id = c.req.param("id");

	const savingGoal = await savingGoalsRepository.deleteSavingGoal(
		id,
		userId,
		prisma,
	);

	return c.json(
		{ message: `Saving goal ${savingGoal.name} successfully deleted ` },
		200,
	);
});

app.post(
	"/contribute",
	zValidator("json", goalContribution),
	requireAuth,
	async (c) => {
		const userId = c.get("userId");
		const validated = c.req.valid("json");

		const contribution = await savingGoalsRepository.addGoalContribution(
			userId,
			validated,
			prisma,
		);

		return c.json(contribution, 201);
	},
);

export default {
	path: "/saving-goals",
	handler: app,
} as const;
