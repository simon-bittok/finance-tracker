import { HTTPException } from "hono/http-exception";
import type { PrismaClient } from "@/generated/prisma/client.js";
import type {
  CreateTransactionInputs,
  TransactionQuery,
  UpdateTransactionInputs,
} from "@/types/transactions.types.js";
import { prisma as defaultPrisma } from "@/utils/prisma.utils.js";

export async function createTransaction(
  userId: string,
  params: CreateTransactionInputs,
  prisma: PrismaClient = defaultPrisma,
) {
  const { amount, accountId, categoryId, description, date } = params;

  const category = await prisma.category.findFirst({
    where: {
      userId,
      id: categoryId,
    },
  });

  if (!category) {
    throw new HTTPException(404, {
      message: "Category not found",
    });
  }

  return await prisma.transaction.create({
    data: {
      userId,
      accountId,
      amount,
      categoryId: category.id,
      description: description ?? "",
      date: date,
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
    include: {
      category: true,
    },
  });
}

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
      throw new HTTPException(404, { message: "Transaction not found" });
    }

    return tx.transaction.delete({
      where: {
        id,
        userId,
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
    });

    if (!existingTransaction) {
      throw new HTTPException(404, {
        message: "Transaction not found",
      });
    }

    let categoryId: string | null = null;

    if (params.categoryId) {
      const category = await tx.category.findFirst({
        where: {
          id: params.categoryId,
          userId,
        },
      });

      if (!category) {
        throw new HTTPException(404, {
          message: "Category not found",
        });
      }

      categoryId = category.id;
    }

    let accountId: string | null = null;

    if (params.accountId) {
      const account = await tx.financialAccount.findFirst({
        where: {
          id: params.accountId,
          userId,
        },
      });

      if (!account) {
        throw new HTTPException(404, {
          message: "Financial Account not found",
        });
      }

      accountId = account.id;
    }

    return await tx.transaction.update({
      where: {
        userId,
        id,
      },
      data: {
        amount: params.amount ?? existingTransaction.amount,
        categoryId: categoryId ?? existingTransaction.categoryId,
        date: params.date ?? existingTransaction.date,
        description: params.description ?? existingTransaction.description,
        accountId: accountId ?? existingTransaction.accountId,
      },
    });
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
