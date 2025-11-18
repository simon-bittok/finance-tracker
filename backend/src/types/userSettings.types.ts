import z from "zod";

export const userSettingsSchema = z.object({
	currency: z.string().optional(),
	locale: z.string().optional(),
	timezone: z.string().optional(),
});

export type UserSettingsInputs = z.infer<typeof userSettingsSchema>;
