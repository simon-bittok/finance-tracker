import z from "zod";

export const createTransactionSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be a positive number")
    .multipleOf(0.01, "Amount must be a multiple of 0.01"),
  description: z.string().optional(),
  date: z.coerce.date(),
  categoryId: z.string(),
  accountId: z.string(),
});

export type CreateTransactionInputs = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z
  .object({
    amount: z.coerce
      .number()
      .positive("Amount must be a positive number")
      .multipleOf(0.01, "Amount must be a multiple of 0.01")
      .optional(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateTransactionInputs = z.infer<typeof updateTransactionSchema>;

export interface TransactionQuery {
  from: Date;
  to: Date;
  type?: "INCOME" | "EXPENSE";
}
