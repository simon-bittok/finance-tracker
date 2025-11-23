import { subDays } from "date-fns";
import type { PrismaClient } from "@/generated/prisma/client.js";
import type {
	CreateTransactionInputs,
	TransactionQuery,
	UpdateTransactionInputs,
} from "@/types/transactions.types.js";
import { prisma as defaultPrisma } from "@/utils/prisma.utils.js";
import { EntityNotFound } from "./error.repository.js";
import { Decimal } from "decimal.js";

export async function createTransaction(
	userId: string,
	params: CreateTransactionInputs,
	prisma: PrismaClient = defaultPrisma,
) {
	const { amount, accountId, categoryId, description, date } = params;

	return await prisma.$transaction(async (tx) => {
		const [category, account] = await Promise.all([
			tx.category.findFirst({
				where: {
					userId,
					id: categoryId,
				},
			}),
			tx.financialAccount.findUnique({
				where: {
					userId,
					id: accountId,
				},
			}),
		]);

		if (!category) {
			throw new EntityNotFound("Category", params.categoryId);
		}

		if (!account) {
			throw new EntityNotFound("Account", params.accountId);
		}

		await tx.financialAccount.update({
			where: {
				id: account?.id,
			},
			data: {
				balance:
					category.type === "INCOME"
						? account.balance.add(amount)
						: account.balance.sub(amount),
			},
		});

		return await tx.transaction.create({
			data: {
				userId,
				accountId,
				amount,
				categoryId: category.id,
				description: description ?? "",
				date: date,
			},
		});
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
		include: {
			category: true,
		},
	});
}

// Transactions should not be deleteable
export async function deleteTransactionById(
	id: string,
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	return prisma.$transaction(async (tx) => {
		const transaction = await tx.transaction.findUnique({
			where: {
				userId,
				id,
			},
		});

		if (!transaction) {
			throw new EntityNotFound("Transaction", id);
		}

		return tx.transaction.update({
			where: {
				id,
				userId,
			},
			data: {
				deletedAt: new Date(),
			},
		});
	});
}

export async function updateTransactionById(
	id: string,
	userId: string,
	params: UpdateTransactionInputs,
	prisma: PrismaClient = defaultPrisma,
) {
	return await prisma.$transaction(async (tx) => {
		const existingTransaction = await tx.transaction.findFirst({
			where: {
				id,
				userId,
			},
			include: {
				category: true,
				financialAccount: true,
			},
		});

		if (!existingTransaction) {
			throw new EntityNotFound("Transaction", id);
		}

		let newCategory = existingTransaction.category;

		if (
			params.categoryId &&
			params.categoryId !== existingTransaction.categoryId
		) {
			const category = await tx.category.findFirst({
				where: {
					id: params.categoryId,
					userId,
				},
			});

			if (!category) {
				throw new EntityNotFound("Category", params.categoryId);
			}

			newCategory = category;
		}

		let newAccount = existingTransaction.financialAccount;

		if (
			params.accountId &&
			params.accountId !== existingTransaction.accountId
		) {
			const account = await tx.financialAccount.findFirst({
				where: {
					id: params.accountId,
					userId,
				},
			});

			if (!account) {
				throw new EntityNotFound("Account", params.accountId);
			}

			newAccount = account;
		}

		const newAmount = params.amount
			? new Decimal(params.amount)
			: existingTransaction.amount;
		const oldAmount = existingTransaction.amount;

		const amountChanged = !newAmount.equals(oldAmount);
		const categoryChanged = newCategory.id !== existingTransaction.categoryId;
		const accountChanged = newAccount.id !== existingTransaction.accountId;

		if (amountChanged || categoryChanged || accountChanged) {
			// Step 1: Reverse the old transaction's effect on old account
			// This brings the account back to its state before the transaction

			const existingEffect =
				existingTransaction.category.type === "INCOME"
					? oldAmount.neg() // Remove the income
					: oldAmount; // Add the expense back

			await tx.financialAccount.update({
				where: {
					id: existingTransaction.accountId,
				},
				data: {
					balance:
						existingTransaction.financialAccount.balance.add(existingEffect),
				},
			});

			const newEffect =
				newCategory.type === "INCOME" ? newAmount : newAmount.neg();

			await tx.financialAccount.update({
				where: {
					id: newAccount.id,
				},
				data: {
					balance:
						newAccount.id === existingTransaction.accountId
							? existingTransaction.financialAccount.balance
									.add(existingEffect)
									.add(newEffect)
							: newAccount.balance.add(newEffect),
				},
			});
		}

		return await tx.transaction.update({
			where: {
				userId,
				id,
			},
			data: {
				amount: newAmount,
				categoryId: newCategory.id,
				date: params.date ?? existingTransaction.date,
				description: params.description ?? existingTransaction.description,
				accountId: newAccount.id,
			},
		});
	});
}

export async function getWeeklyTransactions(
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	const to = new Date();
	const from = subDays(to, 7);

	const transactions = await prisma.transaction.findMany({
		where: {
			userId,
			date: {
				gte: from,
				lte: to,
			},
		},
		orderBy: {
			date: "desc",
		},
	});

	return transactions;
}

export async function groupWeeklyTransactionsByType(
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	const to = new Date();
	const from = subDays(to, 7);

	const transactionSums = await prisma.transaction.groupBy({
		where: {
			userId,
			date: {
				gte: from,
				lte: to,
			},
			deletedAt: null,
		},
		by: ["categoryId"],
		_sum: {
			amount: true,
		},
	});

	const categoriesId = transactionSums.map((t) => t.categoryId);
	const categories = await prisma.category.findMany({
		where: {
			id: { in: categoriesId },
		},
		select: {
			id: true,
			type: true,
			name: true,
		},
	});

	const categoryMap = new Map(categories.map((c) => [c.id, c.type]));
	const sumByType = transactionSums.reduce(
		(acc, t) => {
			const type = categoryMap.get(t.categoryId);
			if (type) {
				acc[type] = (acc[type] || 0) + Number(t._sum.amount);
			}
			return acc;
		},
		{} as Record<string, number>,
	);

	return sumByType;
}

export async function groupTransactionsPerodicallyByType(
	userId: string,
	{ from, to }: { from: Date; to: Date },
	prisma: PrismaClient = defaultPrisma,
) {
	const transactionSums = await prisma.transaction.groupBy({
		where: {
			userId,
			date: {
				gte: from,
				lte: to,
			},
			deletedAt: null,
		},
		by: ["categoryId"],
		_sum: {
			amount: true,
		},
	});

	const categoriesId = transactionSums.map((t) => t.categoryId);
	const categories = await prisma.category.findMany({
		where: {
			id: { in: categoriesId },
		},
		select: {
			id: true,
			type: true,
			name: true,
		},
	});

	const categoryMap = new Map(categories.map((c) => [c.id, c.type]));
	const sumByType = transactionSums.reduce(
		(acc, t) => {
			const type = categoryMap.get(t.categoryId);
			if (type) {
				acc[type] = (acc[type] || 0) + Number(t._sum.amount);
			}
			return acc;
		},
		{} as Record<string, number>,
	);

	return sumByType;
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
