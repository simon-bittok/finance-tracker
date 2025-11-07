import type { TransactionType } from "@/generated/prisma/enums.js";
import {
	type CreateCategoryType,
	type UpdateCategoryType,
} from "@/types/category.js";
import { prisma } from "@/utils/prisma.js";
import { HTTPException } from "hono/http-exception";

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

export async function updateCategoryById(
	id: string,
	userId: string,
	params: UpdateCategoryType,
) {
	const category = await getCategoryById(id, userId);

	if (!category) {
		throw new HTTPException(404, {
			message: "Category not found",
		});
	}

	return await prisma.category.update({
		where: {
			userId,
			id,
		},
		data: {
			name: params.name ?? category.name,
			type: params.type ?? category.type,
			icon: params.icon ?? category.icon,
		},
	});
}

export type GetCategories = Awaited<ReturnType<typeof getAllCategories>>;
export type GetCategory = Awaited<ReturnType<typeof getCategoryById>>;
export type DeleteCategory = Awaited<ReturnType<typeof getCategoryById>>;
export type CreateCategory = Awaited<ReturnType<typeof createCategory>>;
export type UpdateCategory = Awaited<ReturnType<typeof updateCategoryById>>;
