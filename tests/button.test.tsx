// Pourquoi : test exemplaire « primitive » (spec §12) — variantes, état
// désactivé, accessibilité clavier. Sur l'implémentation Tailwind pure
// (copiée telle quelle) et sur la variante MUI.

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button as TwButton } from "~/components/ui/tw/button";
import { Button as MuiButton } from "~/components/ui/mui/button";

describe("button — variantes", () => {
  it("applique la classe de variante demandée (primary par défaut)", () => {
    render(<TwButton>Enregistrer</TwButton>);
    const btn = screen.getByRole("button", { name: "Enregistrer" });
    expect(btn).toHaveClass("bg-primary");
  });

  it("bascule vers outline quand demandé", () => {
    render(<TwButton variant="outline">Annuler</TwButton>);
    expect(screen.getByRole("button", { name: "Annuler" })).toHaveClass("border-input");
  });
});

describe("button — état désactivé et chargement", () => {
  it("disabled passe l'attribut et bloque le clic", () => {
    const onClick = vi.fn();
    render(<TwButton disabled onClick={onClick}>Fermé</TwButton>);
    const btn = screen.getByRole("button", { name: "Fermé" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("isLoading désactive aussi et pose aria-disabled (anti double-clic)", () => {
    const onClick = vi.fn();
    render(<TwButton isLoading onClick={onClick}>Publier</TwButton>);
    const btn = screen.getByRole("button", { name: "Publier" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("variante MUI : isLoading désactive le bouton et affiche un spinner", () => {
    render(<MuiButton isLoading>Charger</MuiButton>);
    const btn = screen.getByRole("button", { name: "Charger" });
    expect(btn).toBeDisabled();
    expect(btn.querySelector(".MuiCircularProgress-root")).not.toBeNull();
  });
});

describe("button — accessibilité clavier", () => {
  it("est un <button> natif : focusable et activable au clavier comme à la souris", () => {
    const onClick = vi.fn();
    const { container } = render(<TwButton onClick={onClick}>Valider</TwButton>);
    const btn = screen.getByRole("button", { name: "Valider" });

    // Élément natif → la navigation clavier (Tab, Entrée, Espace) est
    // gérée par le navigateur, aucune implémentation maison requise.
    expect(container.querySelector("button")).toBe(btn);
    btn.focus();
    expect(btn).toHaveFocus();

    // Activation par événement (le navigateur convertit Entrée/Espace en
    // click sur un bouton natif).
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("variante MUI : rend bien un bouton accessible par rôle", () => {
    render(<MuiButton disabled>Verrouillé</MuiButton>);
    const btn = screen.getByRole("button", { name: "Verrouillé" });
    expect(btn).toBeDisabled();
  });
});