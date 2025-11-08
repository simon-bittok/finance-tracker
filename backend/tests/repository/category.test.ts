import {
	createCategory,
	getAllCategories,
	getCategoryById,
	deleteCategoryById,
	updateCategoryById,
	type GetCategory,
	type DeleteCategory,
	type UpdateCategory,
	type CreateCategory,
	type GetCategories,
} from "@/repository/category.js";
import { describe, expect, it } from "vitest";
import { testDb } from "@tests/setup.js";

const userId = "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg";

describe("Category Repository", async () => {
	it("Should create a category", async () => {
		const category: CreateCategory = await createCategory(
			testDb.prisma,
			{
				name: "Entertainment",
				icon: "discoball",
				type: "EXPENSE",
			},
			userId,
		);

		expect(category).toHaveProperty("id");
		expect(category.name).toBe("Entertainment");
	});

	it("Should fetch all categories for a user", async () => {
		const categories: GetCategories = await getAllCategories(
			testDb.prisma,
			userId,
		);

		expect(categories.length).toBe(4);
	});

	it("Should get a category by ID", async () => {
		const id = "cmhorgpet000034ucpgfadrkj";
		const fetched: GetCategory = await getCategoryById(
			testDb.prisma,
			id,
			userId,
		);

		expect(fetched?.name).toBe("Food & Dining");
	});

	it("Should delete a category by ID", async () => {
		const id = "cmhorgpet000134uc0y6x2phj";
		const deleted: DeleteCategory = await deleteCategoryById(
			testDb.prisma,
			id,
			userId,
		);
		expect(deleted).toHaveProperty("createdAt");

		const exists: GetCategory = await getCategoryById(
			testDb.prisma,
			id,
			userId,
		);
		expect(exists).toBeNull();
	});

	it("Should update category by ID", async () => {
		const id = "cmhorgpet000334ucyllo6vhh";

		const updated: UpdateCategory = await updateCategoryById(
			testDb.prisma,
			id,
			userId,
			{
				icon: "remote",
			},
		);

		expect(updated.icon).toBe("remote");
	});
});
