// Pourquoi : verrouille l'état d'envoi du bouton de soumission.
// Deux garanties : le libellé change (l'utilisateur voit que c'est parti) et le
// bouton se désactive (pas de double soumission).

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StyleEngineProvider } from "~/lib/style-engine";

const nav = { state: "idle" as "idle" | "loading" | "submitting" };

vi.mock("react-router", () => ({
  useNavigation: () => ({ state: nav.state }),
}));

const { SubmitButton } = await import("~/components/patterns/submit-button");

function monter(ui: React.ReactNode) {
  return render(<StyleEngineProvider>{ui}</StyleEngineProvider>);
}

beforeEach(() => {
  nav.state = "idle";
});

describe("SubmitButton", () => {
  it("affiche son libellé normal au repos et reste actif", () => {
    monter(<SubmitButton>Créer la tâche</SubmitButton>);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toContain("Créer la tâche");
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it("change de libellé et se désactive pendant l'envoi", () => {
    nav.state = "submitting";
    monter(<SubmitButton>Créer la tâche</SubmitButton>);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toContain("Enregistrement…");
    expect(btn.textContent).not.toContain("Créer la tâche");
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it("accepte un libellé d'envoi sur mesure", () => {
    nav.state = "submitting";
    monter(<SubmitButton loadingLabel="Suppression…">Supprimer</SubmitButton>);
    expect(screen.getByRole("button").textContent).toContain("Suppression…");
  });

  it("ne se déclenche pas pendant le rechargement des données (loading)", () => {
    // La mutation est déjà partie : retenir l'utilisateur n'a plus de sens.
    nav.state = "loading";
    monter(<SubmitButton>Créer la tâche</SubmitButton>);
    expect(screen.getByRole("button").textContent).toContain("Créer la tâche");
  });

  it("laisse l'état d'un fetcher faire autorité quand il est fourni", () => {
    nav.state = "idle";
    monter(
      <SubmitButton fetcherState="submitting">Créer la tâche</SubmitButton>,
    );
    expect(screen.getByRole("button").textContent).toContain("Enregistrement…");
  });

  it("est de type submit par défaut", () => {
    monter(<SubmitButton>Créer</SubmitButton>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
  });
});
