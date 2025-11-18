import type { PrismaClient } from "@/generated/prisma/client.js";
import type { UserSettingsInputs } from "@/types/userSettings.types.js";
import { prisma as defaultPrisma } from "@/utils/prisma.utils.js";

export async function updateUserCurrency(
	userId: string,
	currency: string,
	prisma: PrismaClient = defaultPrisma,
) {
	return await prisma.userSettings.update({
		data: {
			currency,
		},
		where: {
			userId,
		},
	});
}

export async function createUserSettings(
	userId: string,
	params: UserSettingsInputs,
	prisma: PrismaClient = defaultPrisma,
) {
	const currency = params.currency ?? "USD";

	return await prisma.userSettings.create({
		data: {
			currency,
			userId,
		},
	});
}

export async function getUserSettings(
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	let settings = await prisma.userSettings.findFirst({
		where: {
			userId,
		},
	});

	if (!settings) {
		settings = await createUserSettings(userId, {}, prisma);
	}

	return settings;
}

export type CreateUserSettings = Awaited<ReturnType<typeof createUserSettings>>;
export type UpdateUserCurrency = Awaited<ReturnType<typeof updateUserCurrency>>;
