import { prisma } from "@/utils/prisma.js";
import { seed } from "@prisma/seed.js";
import { afterEach, afterAll, beforeAll, beforeEach } from "vitest";

beforeEach(async () => {
	console.log("Before test setup");
	await prisma.category.deleteMany({});
	await prisma.user.deleteMany({});

	await seed();
});

afterEach(async () => {
	console.log("After test setup");
	// truncate data in tables
	await prisma.category.deleteMany({});
	await prisma.user.deleteMany({});
	await prisma.account.deleteMany({});
});

afterAll(async () => {
	await prisma.$disconnect();
});
