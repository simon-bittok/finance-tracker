import { zValidator } from "@hono/zod-validator";
import type { User } from "better-auth";
import { Hono } from "hono";
import { TransactionType } from "@/generated/prisma/enums.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import type {
  CreateTransaction,
  GetAllTransactions,
  GetTransactionById,
} from "@/repository/transactions.repository.js";
import * as transactionRepository from "@/repository/transactions.repository.js";
import {
  type CreateTransactionInputs,
  createTransactionSchema,
  updateTransactionSchema,
} from "@/types/transactions.types.js";
import type { AuthType } from "@/utils/auth.utils.js";
import { prisma } from "@/utils/prisma.utils.js";

const app = new Hono<{ Bindings: AuthType }>({
  strict: false,
});

app.post(
  "/",
  zValidator("json", createTransactionSchema),
  requireAuth,
  async (c) => {
    const validated: CreateTransactionInputs = c.req.valid("json");
    const user: User = c.get("user");

    const transaction: CreateTransaction =
      await transactionRepository.createTransaction(user.id, validated, prisma);

    return c.json(transaction, 201);
  },
);

app.get("/", requireAuth, async (c) => {
  const user: User = c.get("user");

  const { from, to, type } = c.req.query();

  if (!from || !to) {
    return c.json(
      {
        error: "Please select a date range",
      },
      400,
    );
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  let transactionType: TransactionType | undefined;

  if (type) {
    transactionType =
      type.toLowerCase() === "income"
        ? TransactionType.INCOME
        : TransactionType.EXPENSE;
  }

  const transactions: GetAllTransactions =
    await transactionRepository.getAllTransactions(
      user.id,
      { from: fromDate, to: toDate, type: transactionType },
      prisma,
    );

  return c.json({
    meta: {
      total: transactions.length,
    },
    data: transactions,
  });
});

app.get("/:id", requireAuth, async (c) => {
  const user: User = c.get("user");
  const id = c.req.param("id");

  const transaction: GetTransactionById =
    await transactionRepository.getTransactionById(id, user.id, prisma);

  return c.json(transaction);
});

app.patch(
  "/:id",
  zValidator("json", updateTransactionSchema),
  requireAuth,
  async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const validated = c.req.valid("json");

    const transaction = await transactionRepository.updateTransactionById(
      id,
      userId,
      validated,
      prisma,
    );

    return c.json(transaction, 201);
  },
);

app.delete("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const transaction = await transactionRepository.deleteTransactionById(
    id,
    userId,
    prisma,
  );

  return c.json(transaction, 200);
});

export default {
  handler: app,
  path: "/transactions",
};
