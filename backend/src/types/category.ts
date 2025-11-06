import { TransactionType } from "@/generated/prisma/enums.js";
import z from "zod";

export const createCategorySchema = z.object({
	name: z
		.string()
		.min(3, "Category name requires 3 characters")
		.max(32, "Category name must be under 32 characters."),
	icon: z.string().max(50),
	type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
});

export type CreateCategoryType = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
	name: z
		.string()
		.min(3, "Category name requires 3 characters")
		.max(32, "Category name must be under 32 characters.")
		.optional(),
	icon: z.string().max(50).optional(),
	type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]).optional(),
});

export type UpdateCategoryType = z.infer<typeof updateCategorySchema>;
