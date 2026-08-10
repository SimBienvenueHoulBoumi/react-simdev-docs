// Pourquoi : harnais de test — jest-dom étend les assertions DOM (toBeVisible,
// toHaveAttribute…) et nettoie le DOM entre chaque test.

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});