import z from "zod";

export const createTransferSchema = z.object({
	fromAccountId: z.string().min(1, "From Account ID is required"),
	toAccountId: z.string().min(1, "To Account ID is required"),
	amount: z.coerce.number(),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;

export type TransferQuery = {
	minAmount?: number;
	maxAmount?: number;
	fromAccount?: string;
	toAccount?: string;
};
