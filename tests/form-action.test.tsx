// Pourquoi : test exemplaire « formulaire avec action » (spec §12) — succès
// et erreur serveur via useActionState (React 19), isPending pendant
// l'envoi. L'action est testée aussi isolément (reducer-like, pur).

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useActionState } from "react";
import { describe, expect, it, vi } from "vitest";

/** Mini-formulaire calqué sur la fiche notion-action-state. */
function LoginForm({ action, children }: { action: (prev: Record<string, string>, fd: FormData) => Promise<Record<string, string>>; children?: React.ReactNode }) {
  const [errors, formAction, isPending] = useActionState(action, {});
  return (
    <form action={formAction} aria-label="Connexion">
      <input name="email" type="email" placeholder="Email" aria-invalid={!!errors.email} />
      <input name="password" type="password" placeholder="Mot de passe" aria-invalid={!!errors.password} />
      {errors.email && <p role="alert">{errors.email}</p>}
      {errors.password && <p role="alert">{errors.password}</p>}
      {errors.form && <p role="alert">{errors.form}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Envoi…" : "Se connecter"}
      </button>
      {children}
    </form>
  );
}

function fill(page: HTMLElement | Document) {
  fireEvent.change(page.querySelector('input[name="email"]')!, { target: { value: "a@b.fr" } });
  fireEvent.change(page.querySelector('input[name="password"]')!, { target: { value: "motdepasse" } });
}

describe("formulaire — succès", () => {
  it("soumet, passe isPending puis s'efface sans erreur", async () => {
    const action = vi.fn(async (_prev: Record<string, string>, fd: FormData) => {
      await new Promise((r) => setTimeout(r, 30));
      expect(fd.get("email")).toBe("a@b.fr");
      return {};
    });

    render(<LoginForm action={action} />);
    fill(document);
    const submit = screen.getByRole("button", { name: "Se connecter" });
    fireEvent.submit(screen.getByRole("form", { name: "Connexion" }));

    // isPending pendant l'action → bouton désactivé + libellé « Envoi… »
    await waitFor(() => expect(screen.getByRole("button", { name: "Envoi…" })).toBeDisabled());
    // Retour sans erreur → aucun alert, bouton réactivé
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("button", { name: "Se connecter" })).toBeEnabled());
    expect(action).toHaveBeenCalledTimes(1);
  });
});

describe("formulaire — erreur serveur", () => {
  it("affiche les erreurs renvoyées par l'action et réarme le formulaire", async () => {
    const action = vi.fn(async (_prev: Record<string, string>, _fd: FormData) => ({
      form: "Identifiants refusés",
    }));

    render(<LoginForm action={action} />);
    fill(document);
    fireEvent.submit(screen.getByRole("form", { name: "Connexion" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Identifiants refusés"));
    // Aucune erreur de champ n'est posée : le form reste soumissible
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeEnabled();
  });

  it("l'action seule est testable sans DOM (reducer-like)", async () => {
    const action = async (_prev: Record<string, string>, fd: FormData) => {
      const email = String(fd.get("email") ?? "");
      if (!email.includes("@")) return { email: "Adresse invalide" };
      return {};
    };
    // erreur de validation
    const bad = new FormData();
    bad.set("email", "pas-un-email");
    expect(await action({}, bad)).toEqual({ email: "Adresse invalide" });
    // succès
    const good = new FormData();
    good.set("email", "a@b.fr");
    expect(await action({}, good)).toEqual({});
  });
});

describe("formulaire — isPending lié au cycle réel", () => {
  it("bouton rétabli après échec (pas de désactivation pour toujours)", async () => {
    const action = vi.fn(async () => ({ form: "Service indisponible" }));
    render(<LoginForm action={action} />);
    fill(document);
    fireEvent.submit(screen.getByRole("form", { name: "Connexion" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Service indisponible"));
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeEnabled();
  });
});