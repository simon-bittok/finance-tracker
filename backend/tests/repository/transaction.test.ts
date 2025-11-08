import {
	createTransaction,
	deleteTransactionById,
	getAllTransactions,
	getTransactionById,
	updateTransactionById,
	type CreateTransaction,
	type DeleteTransaction,
	type GetAllTransactions,
	type GetTransactionById,
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

	it("Should retreive a transactions by its specified id", async () => {
		const id = "cmhpyr3lo0003341rp9nvtr9y";
		const transaction: GetTransactionById = await getTransactionById(
			id,
			userId,
			testDb.prisma,
		);

		expect(transaction?.type).toBe("INCOME");
		expect(transaction?.amount).toBe(65000.0);
	});

	it("Should delete a transactions by its specified id", async () => {
		const id = "cmhpyr3lo0003341rp9nvtr9y";
		const transaction: DeleteTransaction = await deleteTransactionById(
			id,
			userId,
			testDb.prisma,
		);

		expect(transaction?.type).toBe("INCOME");

		const exists: GetTransactionById = await getTransactionById(
			id,
			userId,
			testDb.prisma,
		);

		expect(exists).toBeNull();
	});

	it("Should update a transactions by its specified id", async () => {
		const id = "cmhpyr3lo0003341rp9nvtr9y";
		const transaction = await updateTransactionById(
			id,
			userId,
			{
				amount: 68500,
			},
			testDb.prisma,
		);

		expect(transaction?.amount).toBe(68500.0);
	});

	it("Should update a transactions' category by its specified id", async () => {
		const id = "cmhpyr3lo0003341rp9nvtr9y";
		const categoryId = "cmhorgpet000334ucyllo6vhh";
		const transaction = await updateTransactionById(
			id,
			userId,
			{
				amount: 68500,
				categoryName: "Freelancing",
			},
			testDb.prisma,
		);

		expect(transaction?.amount).toBe(68500.0);
		expect(transaction?.categoryId).toBe(categoryId);
	});
});
