import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import ValidationError from "@/errors/validation.error.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import * as transferRepository from "@/repository/transfer.repository.js";
import { createTransferSchema } from "@/types/transfers.types.js";
import type { AuthType } from "@/utils/auth.utils.js";
import { prisma } from "@/utils/prisma.utils.js";

const app = new Hono<{ Bindings: AuthType }>({ strict: false });

app.get("/", requireAuth, async (c) => {
	const userId = c.get("userId");
	const { minAmount, maxAmount, fromAccount, toAccount } = c.req.query();
	const transfers = await transferRepository.getAllTransfers(
		userId,
		{
			maxAmount: maxAmount ? Number(maxAmount) : undefined,
			minAmount: minAmount ? Number(minAmount) : undefined,
			fromAccount,
			toAccount,
		},
		prisma,
	);

	return c.json({
		metadata: {
			total: transfers.length,
		},
		data: transfers,
	});
});

app.get("/:id", requireAuth, async (c) => {
	const userId = c.get("userId");
	const id = c.req.param("id");

	const transfer = await transferRepository.getTransferById(id, userId, prisma);

	return c.json(transfer);
});

app.post(
	"/",
	zValidator("json", createTransferSchema, (result, _) => {
		if (!result.success) {
			throw new ValidationError(result.error.issues);
		}
	}),
	requireAuth,
	async (c) => {
		const userId = c.get("userId");
		const validated = c.req.valid("json");

		const transfer = await transferRepository.createTransfer(
			userId,
			validated,
			prisma,
		);

		return c.json(transfer, 201);
	},
);

export default {
	path: "/transfers",
	handler: app,
};
