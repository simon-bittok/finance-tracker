import { execSync } from "node:child_process";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client.js";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export class Database {
	private dbPath: string | null = null;
	private originalEnv: string | undefined;
	public prisma: PrismaClient;

	constructor() {
		// Only create test database in test environment
		if (process.env.NODE_ENV === "test") {
			// Create unique database file for this test instance
			this.dbPath = path.join(
				process.cwd(),
				"test-dbs",
				`test-${crypto.randomUUID()}.db`,
			);

			// Ensure test-dbs directory exists, if not create it
			const dir = path.dirname(this.dbPath);
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}

			// Store original DATABASE_URL
			this.originalEnv = process.env.DATABASE_URL;
			process.env.DATABASE_URL = `file:${this.dbPath}`;

			this.prisma = new PrismaClient();
		} else {
			// In dev/production, use the existing DATABASE_URL from .env
			this.prisma = prisma;
		}
	}

	async setup() {
		// Only run migrations for test environment
		if (process.env.NODE_ENV === "test" && this.dbPath) {
			execSync("pnpx prisma migrate deploy", {
				env: {
					...process.env,
					DATABASE_URL: `file:${this.dbPath}`,
				},
			});
		}
	}

	async cleanup() {
		// Only cleanup test databases
		if (process.env.NODE_ENV === "test") {
			await this.prisma.$disconnect();

			// Restore the original DATABASE_URL
			if (this.originalEnv) {
				process.env.DATABASE_URL = this.originalEnv;
			} else {
				delete process.env.DATABASE_URL;
			}

			// Delete the database files
			if (this.dbPath && existsSync(this.dbPath)) {
				unlinkSync(this.dbPath);
			}
		} else {
			// In dev/production, just disconnect
			await this.prisma.$disconnect();
		}
	}
}
