import { seed } from "@prisma/seed.js";
import { Database as TestDatabase } from "@utils/prisma.utils.js";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

export let testDb: TestDatabase;

beforeAll(() => {
	process.env.NODE_ENV = "test";
});

beforeEach(async () => {
	testDb = new TestDatabase();
	await testDb.setup();

	await seed(testDb.prisma);
});

afterEach(async () => {
	// truncate data in tables
	await testDb.cleanup();
});

afterAll(() => {
	process.env.NODE_ENV = "";
});
