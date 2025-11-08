import type {
	PrismaClient,
	TransactionType,
} from "@/generated/prisma/client.js";
import type {
	CreateTransactionType,
	TransactionQuery,
	UpdateTransactionType,
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

export async function getTransactionById(
	id: string,
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	return await prisma.transaction.findUnique({
		where: {
			userId,
			id,
		},
	});
}

export async function deleteTransactionById(
	id: string,
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	return await prisma.transaction.delete({
		where: {
			userId,
			id,
		},
	});
}

export async function updateTransactionById(
	id: string,
	userId: string,
	params: UpdateTransactionType,
	prisma: PrismaClient = defaultPrisma,
) {
	const existingTransaction = await getTransactionById(id, userId, prisma);

	if (!existingTransaction) {
		throw new HTTPException(404, {
			message: "Transaction not found",
		});
	}

	let categoryId: string | null = null;
	let categoryIcon: string | null = null;
	let transactionType: TransactionType | null = null;

	if (params.categoryName) {
		const category = await prisma.category.findFirst({
			where: {
				name: params.categoryName,
				userId,
			},
		});

		if (!category) {
			throw new HTTPException(404, {
				message: "Category not found",
			});
		}

		categoryId = category.id;
		categoryIcon = category.icon;
		transactionType = category.type;
	}

	return await prisma.transaction.update({
		where: {
			userId,
			id,
		},
		data: {
			amount: params.amount ?? existingTransaction.amount,
			categoryIcon: categoryIcon ?? existingTransaction.categoryIcon,
			categoryId: categoryId ?? existingTransaction.categoryId,
			date: params.date ?? existingTransaction.date,
			type: transactionType ?? existingTransaction.type,
			description: params.description ?? existingTransaction.description,
		},
	});
}

export type CreateTransaction = Awaited<ReturnType<typeof createTransaction>>;
export type GetAllTransactions = Awaited<ReturnType<typeof getAllTransactions>>;
export type GetTransactionById = Awaited<ReturnType<typeof getTransactionById>>;
export type DeleteTransaction = Awaited<
	ReturnType<typeof deleteTransactionById>
>;
export type UpdateTransaction = Awaited<
	ReturnType<typeof updateTransactionById>
>;
