import z from "zod";

export const createSavingGoalSchema = z.object({
	name: z
		.string()
		.min(3, "Name requires 3 characters")
		.max(100, "Name must be under 100 characters"),
	targetAmount: z.coerce
		.number()
		.positive("Target amount must be a positive number"),
	deadline: z.coerce.date(),
	icon: z.string().min(2, "Icon requires 2 characters"),
});

export type CreateSavingGoalInputs = z.infer<typeof createSavingGoalSchema>;

export const updateSavingGoalSchema = z.object({
	name: z
		.string()
		.min(3, "Name requires 3 characters")
		.max(100, "Name must be under 100 characters")
		.optional(),
	targetAmount: z.coerce
		.number()
		.positive("Target amount must be a positive number")
		.optional(),
	deadline: z.coerce.date().optional(),
	icon: z.string().min(2, "Icon requires 2 characters").optional(),
	isActive: z.boolean().optional(),
});

export type UpdateSavingGoalInputs = z.infer<typeof updateSavingGoalSchema>;

export const goalContribution = z.object({
	goalId: z.string().min(1, "Goal ID is required"),
	amount: z.coerce.number().positive(),
	note: z.string().optional(),
	transactionId: z.string().optional(),
	transferId: z.string().optional(),
});

export type GoalContributionInput = z.infer<typeof goalContribution>;
