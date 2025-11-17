import z from "zod";

export const createCategorySchema = z.object({
	name: z
		.string()
		.min(3, "Category name requires 3 characters")
		.max(32, "Category name must be under 32 characters."),
	icon: z.string().max(50),
	type: z.union([z.literal("INCOME"), z.literal("EXPENSE")]),
});

export type CreateCategoryInputs = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
	name: z
		.string()
		.min(3, "Category name requires 3 characters")
		.max(32, "Category name must be under 32 characters.")
		.optional(),
	icon: z.string().max(50).optional(),
	type: z.union([z.literal("INCOME"), z.literal("EXPENSE")]).optional(),
});

export type UpdateCategoryInputs = z.infer<typeof updateCategorySchema>;
