import { requireAuth } from "@/middlewares/auth.js";
import type { AuthType } from "@/utils/auth.js";
import * as categoryRepository from "@repository/category.js";
import { prisma } from "@/utils/prisma.js";
import { Hono } from "hono";
import type { TransactionType } from "@/generated/prisma/enums.js";
import { zValidator } from "@hono/zod-validator";
import {
	createCategorySchema,
	updateCategorySchema,
} from "@/types/category.js";

const app = new Hono<{ Bindings: AuthType }>({
	strict: false,
});

app.get("/", requireAuth, async (c) => {
	const user = c.get("user");
	const type =
		c.req.query("type") !== undefined
			? (c.req.query("type") as TransactionType)
			: undefined;

	const categories = await categoryRepository.getAllCategories(
		prisma,
		user.id,
		type,
	);

	return c.json(categories);
});

app.post(
	"/",
	zValidator("json", createCategorySchema),
	requireAuth,
	async (c) => {
		const user = c.get("user");
		const validated = c.req.valid("json");

		const category = await categoryRepository.createCategory(
			prisma,
			validated,
			user.id,
		);

		return c.json(category, 201);
	},
);

app.get("/:id", requireAuth, async (c) => {
	const id = c.req.param("id");
	const user = c.get("user");

	const category = await categoryRepository.getCategoryById(
		prisma,
		id,
		user.id,
	);

	if (!category) {
		return c.json({ error: "Category not found" }, 404);
	}

	return c.json(category);
});

app.patch(
	"/:id",
	zValidator("json", updateCategorySchema),
	requireAuth,
	async (c) => {
		const id = c.req.param("id");
		const validated = c.req.valid("json");
		const user = c.get("user");

		const category = await categoryRepository.updateCategoryById(
			prisma,
			id,
			user.id,
			validated,
		);

		return c.json(category);
	},
);

app.delete("/:id", requireAuth, async (c) => {
	const id = c.req.param("id");
	const user = c.get("user");

	const category = await categoryRepository.deleteCategoryById(
		prisma,
		id,
		user.id,
	);

	return c.json(category, 200);
});

export default {
	handler: app,
	path: "/categories",
};
