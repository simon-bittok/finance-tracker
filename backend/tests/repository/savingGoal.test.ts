import {
	createSavingGoal,
	deleteSavingGoal,
	getAllSavingGoals,
	getSavingGoalById,
	updateSavingGoal,
} from "@repository/saving-goals.repository.js";
import { testDb } from "@tests/setup.js";
import { Decimal } from "decimal.js";
import { describe, expect, it } from "vitest";
import type { UpdateSavingGoalInputs } from "@/types/savingGoals.js";

const userId = "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg";
const id = "cmi1oxut4000124xotpi39uhj";

describe("Saving Goals Repository", async () => {
	it("Should create a saving goal", async () => {
		const savingGoal = await createSavingGoal(
			userId,
			{
				name: "Holiday to Japan",
				targetAmount: 35000,
				deadline: new Date("2025-12-12"),
				icon: "airplane",
			},
			testDb.prisma,
		);

		expect(savingGoal.isActive).toBe(true);
	});

	it("Should get all saving goals for a user", async () => {
		const savingGoals = await getAllSavingGoals(userId, testDb.prisma);

		expect(savingGoals.length).toBe(2);
	});

	it("Should update saving goal by id", async () => {
		const params: UpdateSavingGoalInputs = {
			name: "University Education Fund",
			targetAmount: 9500.55,
		};

		const savingGoal = await updateSavingGoal(
			id,
			userId,
			params,
			testDb.prisma,
		);

		expect(savingGoal.name).toBe("University Education Fund");
		expect(savingGoal.targetAmount.toNumber()).toBe(
			new Decimal(9500.55).toNumber(),
		);
	});

	it("Should get a saving goal by its ID", async () => {
		const savingGoal = await getSavingGoalById(id, userId, testDb.prisma);

		expect(savingGoal).toHaveProperty("createdAt");
	});

	it("Should delete a saving goal by its ID", async () => {
		const savingGoal = await deleteSavingGoal(id, userId, testDb.prisma);

		expect(savingGoal).toBeDefined();

		const exists = await getSavingGoalById(id, userId, testDb.prisma);

		expect(exists).toBeNull();
	});
});
