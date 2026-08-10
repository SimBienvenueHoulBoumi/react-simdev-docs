// Pourquoi : config dédiée aux tests (spec §12). Séparée de vite.config.ts
// pour ne PAS charger les plugins web (reactRouter, tailwind) — les
// composants de la banque sont purs React et n'ont pas besoin du router.

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});