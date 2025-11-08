import {
	createTransaction,
	getAllTransactions,
	type CreateTransaction,
	type GetAllTransactions,
} from "@/repository/transactions.js";
import { expect, it, describe } from "vitest";
import { testDb } from "@tests/setup.js";

const userId = "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg";
// const categoryId = "cmhorgpet000334ucyllo6vhh";

describe("Transaction repository", async () => {
	it("Should create a transaction", async () => {
		const transaction: CreateTransaction = await createTransaction(
			userId,
			{
				date: new Date("2025-09-10"),
				amount: 205.65,
				description: "Created a website from a client on upwork",
				categoryName: "Freelancing",
				type: "INCOME",
			},
			testDb.prisma,
		);

		expect(transaction).toHaveProperty("updatedAt");
		expect(transaction.type).toBe("INCOME");
	});

	it("Should retreive all transactions for specified period", async () => {
		const transactions: GetAllTransactions = await getAllTransactions(
			userId,
			{
				to: new Date("2025-10-31"),
				from: new Date("2025-10-01"),
			},
			testDb.prisma,
		);

		expect(transactions.length).toBe(5);
	});

	it("Should retreive all transactions for specified period & type", async () => {
		const transactions: GetAllTransactions = await getAllTransactions(
			userId,
			{
				to: new Date("2025-09-30"),
				from: new Date("2025-09-01"),
				type: "EXPENSE",
			},
			testDb.prisma,
		);

		expect(transactions.length).toBe(1);
	});

	it("Should retreive all transactions for the specified type", async () => {
		const transactions: GetAllTransactions = await getAllTransactions(
			userId,
			{
				to: new Date("2025-10-31"),
				from: new Date("2025-10-01"),
				type: "INCOME",
			},
			testDb.prisma,
		);

		expect(transactions.length).toBe(1);
	});
});
