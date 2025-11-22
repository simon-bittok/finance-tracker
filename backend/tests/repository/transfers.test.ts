import { testDb } from "@tests/setup.js";
import { describe, expect, it } from "vitest";
import {
	createTransfer,
	getAllTransfers,
	getTransferById,
} from "@/repository/transfer.repository.js";

const kcbAccount = "cmhorgpet000034ucpgfadrkj"; // balance 19500
const mpesaAccount = "cmhorgpet000134uc0y6x2phj"; // balance 14500
const paypalAccount = "cmhorgpet000334ucyllo6vhh"; // balance 500 currency USD
const userId = "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg";

describe("Transfers Repository", async () => {
	it("Should transfer funds from Account A to B", async () => {
		const transfer = await createTransfer(
			userId,
			{ fromAccountId: mpesaAccount, toAccountId: kcbAccount, amount: 2500 },
			testDb.prisma,
		);

		expect(transfer.amount.toNumber()).toBe(2500);
	});

	it("Should return an error is transfer amount is greater than from Account balance", async () => {
		await expect(
			createTransfer(
				userId,
				{ fromAccountId: mpesaAccount, toAccountId: kcbAccount, amount: 14550 },
				testDb.prisma,
			),
		).rejects.toThrow();
	});

	it("Should throw when currencies are not the same", async () => {
		await expect(
			createTransfer(userId, {
				fromAccountId: paypalAccount,
				toAccountId: kcbAccount,
				amount: 45,
			}),
		).rejects.toThrow();
	});

	it("Should fetch all Transfer Records", async () => {
		const transfers = await getAllTransfers(userId, {}, testDb.prisma);

		expect(transfers.length).toBe(5);
	});

	it("Should fetch a transfer by ID", async () => {
		const id = "83d87a2a-b451-4bed-b51d-f542052fde44";
		const transfer = await getTransferById(id, userId, testDb.prisma);

		expect(transfer.amount.toNumber()).toBe(369);
	});
});
