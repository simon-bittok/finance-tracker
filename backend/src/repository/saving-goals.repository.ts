import { prisma as defaultPrisma } from "@utils/prisma.js";
import { HTTPException } from "hono/http-exception";
import type { PrismaClient } from "@/generated/prisma/client.js";

export async function getAllSavingGoals(
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	return prisma.savingGoal.findMany({
		where: {
			userId,
		},
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
	});

	if (!savingGoal) {
		throw new HTTPException(404, {
			message: "Saving Goal not found",
		});
	}

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

export type GetAllSavingGoals = Awaited<ReturnType<typeof getAllSavingGoals>>;
export type GetSavingGoalById = Awaited<ReturnType<typeof getSavingGoalById>>;
export type DeleteSavingGoal = Awaited<ReturnType<typeof deleteSavingGoal>>;
