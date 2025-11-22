import { prisma as defaultPrisma } from "@utils/prisma.utils.js";
import type { PrismaClient } from "@/generated/prisma/client.js";
import type { TransactionType } from "@/generated/prisma/enums.js";
import type {
	CreateCategoryInputs,
	UpdateCategoryInputs,
} from "@/types/category.types.js";
import { EntityAlreadyExists, EntityNotFound } from "./error.repository.js";

export async function createCategory(
	userId: string,
	data: CreateCategoryInputs,
	prisma: PrismaClient = defaultPrisma,
) {
	const { name, icon, type } = data;

	const existing = await prisma.category.findFirst({
		where: {
			userId,
			name,
			type,
		},
	});

	if (existing) {
		throw new EntityAlreadyExists("Category", "name, type");
	}

	return await prisma.category.create({
		data: {
			userId,
			name,
			icon,
			type,
		},
	});
}

export async function getAllCategories(
	userId: string,
	type?: TransactionType,
	prisma: PrismaClient = defaultPrisma,
) {
	return await prisma.category.findMany({
		where: {
			userId,
			...(type && { type }),
		},
		include: {
			transactions: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function getCategoryById(
	id: string,
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
	return await prisma.category.findUnique({
		where: {
			userId,
			id,
		},
		include: {
			transactions: true,
		},
	});
}

export async function deleteCategoryById(
	id: string,
	userId: string,
	prisma: PrismaClient = defaultPrisma,
) {
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
	params: UpdateCategoryInputs,
	prisma: PrismaClient = defaultPrisma,
) {
	const category = await getCategoryById(id, userId, prisma);

	if (!category) {
		throw new EntityNotFound("Category", id);
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
export type DeleteCategory = Awaited<ReturnType<typeof deleteCategoryById>>;
export type CreateCategory = Awaited<ReturnType<typeof createCategory>>;
export type UpdateCategory = Awaited<ReturnType<typeof updateCategoryById>>;
