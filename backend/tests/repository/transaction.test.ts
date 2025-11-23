import { testDb } from "@tests/setup.js";
import { describe, expect, it } from "vitest";
import {
	type CreateTransaction,
	createTransaction,
	deleteTransactionById,
	type GetAllTransactions,
	type GetTransactionById,
	getAllTransactions,
	getTransactionById,
	updateTransactionById,
	getWeeklyTransactions,
	groupWeeklyTransactionsByType,
	groupTransactionsPerodicallyByType,
} from "@/repository/transactions.repository.js";

const userId = "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg";
const categoryId = "cmhorgpet000334ucyllo6vhh";
const accountId = "cmhorgpet000234ucpgpk6k78";

describe("Transaction repository", async () => {
	it("Should create a transaction", async () => {
		const transaction: CreateTransaction = await createTransaction(
			userId,
			{
				date: new Date("2025-09-10"),
				amount: 205.65,
				description: "Created a website from a client on upwork",
				categoryId,
				accountId,
			},
			testDb.prisma,
		);

		expect(transaction).toBeDefined();

		expect(transaction).toHaveProperty("updatedAt");
	});

	it("Should sum up the weekly transactions amounts by type", async () => {
		const amounts = await groupWeeklyTransactionsByType(userId, testDb.prisma);

		console.log(amounts);

		expect(amounts).toBeDefined();
	});

	it("Should sum up the transactions amounts by type for period specified", async () => {
		const from = new Date("2025-9-23");
		const to = new Date("2025-11-23");
		const amounts = await groupTransactionsPerodicallyByType(
			userId,
			{
				from,
				to,
			},
			testDb.prisma,
		);

		console.log(amounts);

		expect(amounts).toBeDefined();
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

		expect(transactions.length).toBe(4);
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

		console.log(transactions);

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

		expect(transaction?.amount.toNumber()).toBe(65000.0);
	});

	it("Should delete a transactions by its specified id", async () => {
		const id = "cmhpyr3lo0003341rp9nvtr9y";
		await deleteTransactionById(id, userId, testDb.prisma);

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

		expect(transaction?.amount.toNumber()).toBe(68500.0);
	});

	it("Should update a transactions' category by its specified id", async () => {
		const id = "cmhpyr3lo0003341rp9nvtr9y";
		const categoryId = "cmhorgpet000334ucyllo6vhh";
		const transaction = await updateTransactionById(
			id,
			userId,
			{
				amount: 68500,
				categoryId,
			},
			testDb.prisma,
		);

		expect(transaction?.amount.toNumber()).toBe(68500.0);
		expect(transaction?.categoryId).toBe(categoryId);
	});

	it("Should fetch all transactions from the week ending today", async () => {
		const transactions = await getWeeklyTransactions(userId, testDb.prisma);

		console.log(transactions);

		expect(transactions).toBeDefined();
	});
});
