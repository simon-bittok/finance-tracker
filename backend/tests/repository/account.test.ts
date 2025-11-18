import { testDb } from "@tests/setup.js";
import { describe, expect, it } from "vitest";
import {
  createFinancialAccount,
  getAllFinancialAccounts,
  getFinancialAccountById,
  updateFinancialAccount,
} from "@/repository/accounts.repository.js";
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "@/types/accounts.types.js";

const userId = "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg";
const accountId = "cmhorgpet000134uc0y6x2phj";

describe("Financial Account Repository", async () => {
  it("Should create a financial account", async () => {
    const params: CreateAccountInput = {
      name: "Checking Account",
      currency: "KES",
      type: "BANK",
      balance: 36500,
      metadata: {
        bankName: "Equity Bank",
        accountNumber: "0123456789",
        branch: "Westlands",
        accountType: "checking",
        swiftCode: "EQBLKENA",
        lastSyncedAt: "2025-11-18T10:30:00Z",
      },
    };

    const created = await createFinancialAccount(userId, params, testDb.prisma);

    expect(created).toBeDefined();
    expect(created.name).toBe("Checking Account");
  });

  it("Should update a financial account", async () => {
    const params: UpdateAccountInput = {
      metadata: {
        provider: "Safaricom",
        phoneNumber: "+254712345678",
        tillNumber: "123456",
        paybillNumber: "400200",
        lastBalance: 5000.0,
        lastChecked: "2025-11-18T08:00:00Z",
      },
    };

    const updated = await updateFinancialAccount(
      accountId,
      userId,
      params,
      testDb.prisma,
    );

    expect(updated).toBeDefined();
    expect(updated.updatedAt.getTime()).toBeLessThan(Date.now());
  });

  it("Should get all of a user's accounts", async () => {
    const accounts = await getAllFinancialAccounts(userId, testDb.prisma);

    expect(accounts.length).toBe(4);
  });

  it("Should get a Financial Account by its ID", async () => {
    const account = await getFinancialAccountById(
      accountId,
      userId,
      testDb.prisma,
    );

    console.log(account);

    expect(account.name).toBe("Mpesa");
  });
});
