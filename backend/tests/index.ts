import { prisma } from "@/utils/prisma.js";
import { afterEach, afterAll } from "vitest";

afterEach(async () => {
	// truncate data in tables
	await prisma.category.deleteMany({});
});

afterAll(async () => {
	await prisma.$disconnect();
});
