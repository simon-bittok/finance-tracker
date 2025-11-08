import type { PrismaClient } from "@/generated/prisma/client.js";
import type {
	CreateTransactionType,
	TransactionQuery,
} from "@/types/transactions.js";
import { prisma as defaultPrisma } from "@utils/prisma.js";
import { HTTPException } from "hono/http-exception";

export async function createTransaction(
	userId: string,
	params: CreateTransactionType,
	prisma: PrismaClient = defaultPrisma,
) {
	const { amount, categoryName, type, description, date } = params;

	const category = await prisma.category.findFirst({
		where: {
			userId,
			name: categoryName,
		},
	});

	if (!category) {
		throw new HTTPException(404, {
			message: `Category ${categoryName} not found`,
		});
	}

	return await prisma.transaction.create({
		data: {
			userId,
			amount,
			categoryId: category.id,
			categoryIcon: category.icon,
			description: description ?? "",
			date,
			type,
		},
	});
}

export async function getAllTransactions(
	userId: string,
	query: TransactionQuery,
	prisma: PrismaClient = defaultPrisma,
) {
	const { from, to, type } = query;

	return await prisma.transaction.findMany({
		where: {
			userId,
			date: {
				gte: from,
				lte: to,
			},
			...(type && { category: { type } }),
		},
		include: {
			category: true,
		},
		orderBy: {
			date: "desc",
		},
	});
}

export type CreateTransaction = Awaited<ReturnType<typeof createTransaction>>;
export type GetAllTransactions = Awaited<ReturnType<typeof getAllTransactions>>;
