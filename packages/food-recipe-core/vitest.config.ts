import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts", "src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["**/node_modules/**", "tests/e2e/**"],
  },
  resolve: {
    alias: [
      { find: /^@app\/(.*)$/, replacement: path.resolve(__dirname, "./src/food_recipe") + "/$1" },
      { find: /^@tests\/(.*)$/, replacement: path.resolve(__dirname, "./tests") + "/$1" },
    ],
  },
});
