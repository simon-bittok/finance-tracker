import type { TransactionType } from "@/generated/prisma/enums.js";
import { type CreateCategoryType } from "@/types/category.js";
import { prisma } from "@/utils/prisma.js";

export async function createCategory(data: CreateCategoryType, userId: string) {
	const { name, icon, type } = data;

	return await prisma.category.create({
		data: {
			userId,
			name,
			icon,
			type,
		},
	});
}

export async function getAllCategories(userId: string, type?: TransactionType) {
	return await prisma.category.findMany({
		where: {
			userId,
			...(type && { type }),
		},
	});
}

export async function getCategoryById(id: string, userId: string) {
	return await prisma.category.findUnique({
		where: {
			userId,
			id,
		},
	});
}

export async function deleteCategoryById(id: string, userId: string) {
	return await prisma.category.delete({
		where: {
			id,
			userId,
		},
	});
}

export type GetAllCategories = Awaited<ReturnType<typeof getAllCategories>>;
export type GetCategoryById = Awaited<ReturnType<typeof getCategoryById>>;
export type DeleteCategoryById = Awaited<ReturnType<typeof getCategoryById>>;
export type CreateCategory = Awaited<ReturnType<typeof createCategory>>;
