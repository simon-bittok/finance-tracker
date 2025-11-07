import type { CreateTransactionType } from "@/types/transactions.js";
import { prisma } from "@/utils/prisma.js";
import { HTTPException } from "hono/http-exception";

export async function createTransaction(
	userId: string,
	params: CreateTransactionType,
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

export type CreateTransaction = Awaited<ReturnType<typeof createTransaction>>;
