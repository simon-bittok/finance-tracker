// Database access code for `FinancialAccount` model
/** biome-ignore-all lint/suspicious/noExplicitAny: The value for the metadata can be any JS type or more */

import { prisma as defaultPrisma } from "@utils/prisma.utils.js";
import { HTTPException } from "hono/http-exception";
import type { AccountType, PrismaClient } from "@/generated/prisma/client.js";
import type {
  AccountQuery,
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
        type: type as AccountType,
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
        type: type as AccountType,
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
          type: (type as AccountType) ?? existing.type,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new HTTPException(409, {
          message: "Account with this name already exists",
        });
      }
    }

    const currentMetadata = existing.metadata as Record<string, any>;

    return tx.financialAccount.update({
      where: {
        id: existing.id,
      },
      data: {
        ...(name && { name }),
        ...(type && { type: type as AccountType }),
        ...(currency && { currency }),
        ...(metadata && {
          metadata: {
            ...currentMetadata,
            ...metadata,
          },
        }),
      },
    });
  });
}

export async function getAllActiveFinancialAccounts(
  userId: string,
  prisma: PrismaClient = defaultPrisma,
) {
  return await prisma.financialAccount.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAllFinancialAccounts(
  userId: string,
  query: AccountQuery,
  prisma: PrismaClient = defaultPrisma,
) {
  const { isActive, type, currency } = query;

  return await prisma.financialAccount.findMany({
    where: {
      userId,
      ...(isActive && { deletedAt: isActive ? null : { not: null } }),
      ...(type && { type: type as AccountType }),
      ...(currency && { currency }),
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAllInactiveFinancialAccounts(
  userId: string,
  prisma: PrismaClient = defaultPrisma,
) {
  return await prisma.financialAccount.findMany({
    where: {
      userId,
      deletedAt: { not: null },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function restoreFinancialAccountById(
  id: string,
  userId: string,
  prisma: PrismaClient = defaultPrisma,
) {
  return await prisma.financialAccount.update({
    where: {
      id,
      userId,
    },
    data: {
      deletedAt: null,
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

export async function deleteFinancialAccountById(
  id: string,
  userId: string,
  prisma: PrismaClient = defaultPrisma,
) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.financialAccount.findFirst({
      where: {
        userId,
        id,
      },
    });

    if (!account) {
      throw new HTTPException(403, {
        message:
          "Account not found or You do not have permission to perform this action",
      });
    }

    return await tx.financialAccount.update({
      where: {
        id: account.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  });
}

export type CreateFinancialAccount = Awaited<
  ReturnType<typeof createFinancialAccount>
>;
export type UpdateFinancialAccount = Awaited<
  ReturnType<typeof updateFinancialAccount>
>;
export type DeleteFinancialAccount = Awaited<
  ReturnType<typeof deleteFinancialAccountById>
>;
export type GetAllFinancialAccounts = Awaited<
  ReturnType<typeof getAllFinancialAccounts>
>;

export type GetFinancialAccountById = Awaited<
  ReturnType<typeof getFinancialAccountById>
>;

export type RestoreFinancialAccountById = Awaited<
  ReturnType<typeof restoreFinancialAccountById>
>;

export type GetAllActiveFinancialAccounts = Awaited<
  ReturnType<typeof getAllActiveFinancialAccounts>
>;

export type GetAllDeletedFinancialAccounts = Awaited<
  ReturnType<typeof getAllInactiveFinancialAccounts>
>;
