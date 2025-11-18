// Database access code for `FinancialAccount` model

import { prisma as defaultPrisma } from "@utils/prisma.utils.js";
import { HTTPException } from "hono/http-exception";
import type { PrismaClient } from "@/generated/prisma/client.js";
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "@/types/accounts.types.js";

export async function createFinancialAccount(
  userId: string,
  params: CreateAccountInput,
  prisma: PrismaClient = defaultPrisma,
) {
  const { balance, currency, name, type, metadata } = params;

  return await prisma.$transaction(async (tx) => {
    const exists = await tx.financialAccount.findFirst({
      where: {
        userId,
        name,
        type,
      },
    });

    if (exists) {
      throw new HTTPException(409, {
        message: "Account with this name & type already exists",
      });
    }

    const financialAccount = await tx.financialAccount.create({
      data: {
        userId,
        name,
        type,
        metadata,
        balance: balance ?? 0,
        currency: currency ?? "KES",
      },
    });

    return financialAccount;
  });
}

export async function updateFinancialAccount(
  id: string,
  userId: string,
  params: UpdateAccountInput,
  prisma: PrismaClient = defaultPrisma,
) {
  const { name, currency, type, metadata } = params;
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.financialAccount.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new HTTPException(404, {
        message: "Failed to update. Account not found or Unauthorised",
      });
    }

    if (name && name !== existing.name) {
      const duplicate = await tx.financialAccount.findFirst({
        where: {
          userId,
          name,
          type: type ?? existing.type,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new HTTPException(409, {
          message: "Account with this name already exists",
        });
      }
    }

    return tx.financialAccount.update({
      where: {
        id: existing.id,
      },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(currency && { currency }),
        ...(metadata && { metadata }),
      },
    });
  });
}

export async function getAllFinancialAccounts(
  userId: string,
  prisma: PrismaClient = defaultPrisma,
) {
  return await prisma.financialAccount.findMany({
    where: {
      userId,
    },
  });
}

export async function getFinancialAccountById(
  id: string,
  userId: string,
  prisma: PrismaClient = defaultPrisma,
) {
  const account = await prisma.financialAccount.findUnique({
    where: {
      userId,
      id,
    },
  });

  if (!account) {
    throw new HTTPException(404, { message: "Account not found" });
  }

  return account;
}

export type CreateFinancialAccount = Awaited<
  ReturnType<typeof createFinancialAccount>
>;
export type UpdateFinancialAccount = Awaited<
  ReturnType<typeof updateFinancialAccount>
>;
