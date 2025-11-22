import type { PrismaClient } from "@/generated/prisma/client.js";
import type {
	CreateTransferInput,
	TransferQuery,
} from "@/types/transfers.types.js";
import { prisma as defaultPrisma } from "@/utils/prisma.utils.js";
import {
	CurrencyMistmatchError,
	EntityNotFound,
	InsufficientBalanceError,
} from "./error.repository.js";

export async function createTransfer(
	userId: string,
	params: CreateTransferInput,
	prisma: PrismaClient = defaultPrisma,
) {
	return await prisma.$transaction(async (tx) => {
		const [fromAccount, toAccount] = await Promise.all([
			tx.financialAccount.findUnique({
				where: {
					userId,
					id: params.fromAccountId,
				},
			}),
			tx.financialAccount.findUnique({
				where: {
					userId,
					id: params.toAccountId,
				},
			}),
		]);

		if (!fromAccount) {
			throw new EntityNotFound("Account", params.fromAccountId);
		}

		if (!toAccount) {
			throw new EntityNotFound("Account", params.toAccountId);
		}

		if (fromAccount.currency !== toAccount.currency) {
			throw new CurrencyMistmatchError(
				fromAccount.currency,
				toAccount.currency,
			);
		}

		if (fromAccount.balance.lt(params.amount)) {
			throw new InsufficientBalanceError(
				fromAccount.id,
				fromAccount.balance.toString(),
				params.amount.toString(),
			);
		}

		await Promise.all([
			tx.financialAccount.update({
				where: {
					id: fromAccount.id,
				},
				data: {
					balance: fromAccount.balance.sub(params.amount),
				},
			}),

			await tx.financialAccount.update({
				data: {
					balance: toAccount.balance.add(params.amount),
				},
				where: {
					id: toAccount.id,
				},
			}),
		]);

		return await tx.transfer.create({
			data: {
				userId,
				fromAccountId: fromAccount.id,
				toAccountId: toAccount.id,
				amount: params.amount,
			},
		});
	});
}

export async function getAllTransfers(
	userId: string,
	query: TransferQuery,
	prisma: PrismaClient = defaultPrisma,
) {
	const { maxAmount, minAmount, fromAccount, toAccount } = query;

	const queryRange = minAmount !== undefined && maxAmount !== undefined;
	const queryMinOnly = minAmount !== undefined && maxAmount === undefined;
	const queryMaxOnly = maxAmount !== undefined && minAmount === undefined;

	return await prisma.transfer.findMany({
		where: {
			userId,
			...(queryRange && {
				amount: {
					gte: minAmount,
					lte: maxAmount,
				},
			}),
			...(queryMinOnly && {
				amount: {
					gte: minAmount,
				},
			}),
			...(queryMaxOnly && {
				amount: {
					lte: maxAmount,
				},
			}),
			...(fromAccount && { fromAccountId: fromAccount }),
			...(toAccount && { toAccountId: toAccount }),
		},
		include: {
			fromAccount: true,
			toAccount: true,
		},
		take: 20,
	});
}

export async function getTransferById(
	id: string,
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	const transfer = await prisma.transfer.findUnique({
		where: {
			userId,
			id,
		},
		include: {
			fromAccount: true,
			toAccount: true,
		},
	});

	if (!transfer) {
		throw new EntityNotFound("Account", id);
	}

	return transfer;
}

export type CreateTransfer = Awaited<ReturnType<typeof createTransfer>>;
export type GetAllTransfers = Awaited<ReturnType<typeof getAllTransfers>>;
export type GetTransferById = Awaited<ReturnType<typeof getTransferById>>;
