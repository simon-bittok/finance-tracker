import { prisma as defaultPrisma } from "@utils/prisma.js";
import { HTTPException } from "hono/http-exception";
import type { PrismaClient } from "@/generated/prisma/client.js";
import type {
	CreateSavingGoalInputs,
	GoalContributionInput,
	UpdateSavingGoalInputs,
} from "@/types/savingGoals.js";

export async function getAllSavingGoals(
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	return prisma.savingGoal.findMany({
		where: {
			userId,
		},
		include: {
			goalContributions: true,
		},
		orderBy: {
			deadline: "asc",
		},
	});
}

export async function createSavingGoal(
	userId: string,
	params: CreateSavingGoalInputs,
	prisma: PrismaClient = defaultPrisma,
) {
	const { deadline, name, targetAmount, icon } = params;
	return await prisma.$transaction(async (tx) => {
		// check to see the goal is unique: name, userId & deadline & targetAmount
		const exists = await tx.savingGoal.findUnique({
			where: {
				userId_name_targetAmount_deadline: {
					userId,
					targetAmount,
					deadline,
					name,
				},
			},
		});

		if (exists) {
			throw new HTTPException(409, { message: "Saving goal already exists" });
		}

		return await tx.savingGoal.create({
			data: {
				userId,
				targetAmount,
				deadline,
				name,
				icon,
				currentAmount: 0,
				isActive: true,
			},
		});
	});
}

export async function updateSavingGoal(
	id: string,
	userId: string,
	params: UpdateSavingGoalInputs,
	prisma: PrismaClient = defaultPrisma,
) {
	const { deadline, name, targetAmount, isActive, icon } = params;

	return await prisma.$transaction(async (tx) => {
		const exists = await tx.savingGoal.findUnique({
			where: {
				userId,
				id,
			},
		});

		if (!exists) {
			throw new HTTPException(422, {
				message: "Cannot update non existent Saving Goal",
			});
		}

		return await tx.savingGoal.update({
			where: {
				userId,
				id,
			},
			data: {
				deadline: deadline ?? exists.deadline,
				name: name ?? exists.name,
				targetAmount: targetAmount ?? exists.targetAmount,
				isActive: isActive ?? exists.isActive,
				icon: icon ?? exists.icon,
			},
		});
	});
}

export async function getSavingGoalById(
	id: string,
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	const savingGoal = await prisma.savingGoal.findUnique({
		where: {
			id,
			userId,
		},
		include: {
			goalContributions: true,
		},
	});

	return savingGoal;
}

export async function deleteSavingGoal(
	id: string,
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	return prisma.$transaction(async (txn) => {
		const goal = await txn.savingGoal.findUnique({
			where: {
				id,
				userId,
			},
		});

		if (!goal) {
			throw new HTTPException(403, {
				message: "Forbidden",
			});
		}

		return await txn.savingGoal.delete({
			where: {
				userId,
				id,
			},
		});
	});
}

export async function addGoalContribution(
	userId: string,
	params: GoalContributionInput,
	prisma: PrismaClient = defaultPrisma,
) {
	const { goalId, amount, transactionId, note } = params;
	return await prisma.$transaction(async (tx) => {
		const contribution = await tx.goalContribution.create({
			data: {
				goalId,
				note,
				amount,
				transactionId,
			},
		});

		const savingGoal = await tx.savingGoal.update({
			where: {
				id: goalId,
				userId,
			},
			data: {
				currentAmount: {
					increment: amount,
				},
			},
		});

		return { contribution, savingGoal };
	});
}

export type GetAllSavingGoals = Awaited<ReturnType<typeof getAllSavingGoals>>;
export type GetSavingGoalById = Awaited<ReturnType<typeof getSavingGoalById>>;
export type DeleteSavingGoal = Awaited<ReturnType<typeof deleteSavingGoal>>;
export type UpdateSavingGoal = Awaited<ReturnType<typeof updateSavingGoal>>;
export type CreateSavingGoal = Awaited<ReturnType<typeof createSavingGoal>>;
export type AddGoalContribution = Awaited<
	ReturnType<typeof addGoalContribution>
>;
