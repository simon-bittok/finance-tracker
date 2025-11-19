import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import ValidationError from "@/errors/validation.error.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import * as accountRepository from "@/repository/accounts.repository.js";
import {
  createAccountSchema,
  updateAccountSchema,
} from "@/types/accounts.types.js";
import type { AuthType } from "@/utils/auth.utils.js";
import { prisma } from "@/utils/prisma.utils.js";

const app = new Hono<{ Bindings: AuthType }>({
  strict: false,
});

app.get("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const accounts = await accountRepository.getAllActiveFinancialAccounts(
    userId,
    prisma,
  );

  return c.json({
    metadata: {
      total: accounts.length,
    },
    data: accounts,
  });
});

app.post(
  "/",
  requireAuth,
  zValidator("json", createAccountSchema, (result, _) => {
    if (!result.success) {
      throw new ValidationError(result.error.issues);
    }
  }),
  async (c) => {
    const userId = c.get("userId");
    const params = c.req.valid("json");
    const account = await accountRepository.createFinancialAccount(
      userId,
      params,
      prisma,
    );

    return c.json(account, 201);
  },
);

app.get("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const account = await accountRepository.getFinancialAccountById(
    id,
    userId,
    prisma,
  );

  return c.json(account);
});

app.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateAccountSchema, (result, _) => {
    if (!result.success) {
      throw new ValidationError(result.error.issues);
    }
  }),
  async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const valid = c.req.valid("json");

    const account = await accountRepository.updateFinancialAccount(
      id,
      userId,
      valid,
      prisma,
    );

    return c.json(account, 201);
  },
);

app.delete("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const deleted = await accountRepository.deleteFinancialAccountById(
    id,
    userId,
    prisma,
  );

  return c.json(deleted, 200);
});

export default {
  path: "/financial-accounts",
  handler: app,
};
