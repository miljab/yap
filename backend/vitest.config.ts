import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: ["./testSetup.ts"],
    setupFiles: ["./testCleanup.ts"],
    fileParallelism: false,
  },
});
