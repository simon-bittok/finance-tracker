import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		include: ["tests/**/*.test.ts"],
		setupFiles: ["./tests/setup.ts"],
		sequence: {
			concurrent: false, // was causing race conditions
		},
		fileParallelism: false,
	},
});
