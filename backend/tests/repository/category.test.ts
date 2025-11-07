import {
	createCategory,
	getAllCategories,
	getCategoryById,
	deleteCategoryById,
	updateCategoryById,
} from "@/repository/category.js";
import { describe, expect, it } from "vitest";

const userId = "SvglSWBlcXqS08v6VdPcUIj6qAOKTql5";

describe("Category Repository", async () => {
	it("Should create a category", async () => {
		const category = await createCategory(
			{
				name: "Food & Dining",
				icon: "bugger",
				type: "EXPENSE",
			},
			userId,
		);

		expect(category).toHaveProperty("id");
		expect(category.name).toBe("Food & Dining");
	});

	it("Should fetch all categories for a user", async () => {
		await createCategory(
			{ name: "Salary", icon: "bag-money", type: "INCOME" },
			userId,
		);
		const categories = await getAllCategories(userId);

		expect(categories.length).toBe(1);
	});

	it("Should get a category by ID", async () => {
		const category = await createCategory(
			{ name: "Bills & Utilities", icon: "credit-card", type: "EXPENSE" },
			userId,
		);
		const fetched = await getCategoryById(category.id, userId);

		expect(fetched?.name).toBe("Bills & Utilities");
	});

	it("Should delete a category by ID", async () => {
		const category = await createCategory(
			{
				name: "Groceries & Toiletries",
				icon: "shopping-cart",
				type: "EXPENSE",
			},
			userId,
		);
		const deleted = await deleteCategoryById(category.id, userId);
		expect(deleted).toHaveProperty("createdAt");

		const exists = await getCategoryById(category.id, userId);
		expect(exists).toBeNull();
	});

	it("Should update category by ID", async () => {
		const category = await createCategory(
			{
				name: "Freelance",
				icon: "airplane",
				type: "INCOME",
			},
			userId,
		);

		const updated = await updateCategoryById(category.id, userId, {
			icon: "remote",
		});

		expect(updated.icon).toBe("remote");
	});
});
