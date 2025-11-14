import type { TransactionType } from "@/generated/prisma/enums.js";
import { requireAuth } from "@/middlewares/auth.js";
import {
	createCategorySchema,
	updateCategorySchema,
	type CreateCategoryInputs,
	type UpdateCategoryInputs,
} from "@/types/category.js";
import type { AuthType } from "@/utils/auth.js";
import { prisma } from "@/utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import * as categoryRepository from "@/repository/category.repository.js";
import { Hono } from "hono";

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
		user.id,
		type,
		prisma,
	);

	return c.json({ meta: { total: categories.length }, data: categories });
});

app.post(
	"/",
	zValidator("json", createCategorySchema),
	requireAuth,
	async (c) => {
		const user = c.get("user");
		const validated: CreateCategoryInputs = c.req.valid("json");

		const category: categoryRepository.CreateCategory =
			await categoryRepository.createCategory(user.id, validated, prisma);

		return c.json(category, 201);
	},
);

app.get("/:id", requireAuth, async (c) => {
	const id = c.req.param("id");
	const user = c.get("user");

	const category: categoryRepository.GetCategory =
		await categoryRepository.getCategoryById(id, user.id, prisma);

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
		const validated: UpdateCategoryInputs = c.req.valid("json");
		const user = c.get("user");

		const category: categoryRepository.UpdateCategory =
			await categoryRepository.updateCategoryById(
				id,
				user.id,
				validated,
				prisma,
			);

		return c.json(category);
	},
);

app.delete("/:id", requireAuth, async (c) => {
	const id = c.req.param("id");
	const user = c.get("user");

	const category = await categoryRepository.deleteCategoryById(
		id,
		user.id,
		prisma,
	);

	return c.json(category, 200);
});

export default {
	handler: app,
	path: "/categories",
};
