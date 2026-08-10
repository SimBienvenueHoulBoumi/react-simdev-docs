// Pourquoi : verrouille l'indicateur global de navigation. Le point sensible
// est le seuil anti-clignotement : trop tôt il flashe sur chaque clic instantané,
// absent il ne sert à rien. On teste les deux bords.

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = { current: "idle" as "idle" | "loading" | "submitting" };

vi.mock("react-router", () => ({
  useNavigation: () => ({ state: state.current }),
}));

const { NavigationProgress } = await import(
  "~/components/layout/navigation-progress"
);

beforeEach(() => {
  vi.useFakeTimers();
  state.current = "idle";
});
afterEach(() => {
  vi.useRealTimers();
});

describe("NavigationProgress", () => {
  it("reste invisible tant que la navigation est au repos", () => {
    render(<NavigationProgress />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("ne clignote pas : rien ne s'affiche avant le seuil", () => {
    state.current = "loading";
    render(<NavigationProgress />);
    act(() => {
      vi.advanceTimersByTime(140);
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("s'affiche quand la navigation dépasse le seuil", () => {
    state.current = "loading";
    render(<NavigationProgress />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-label")).toBe("Chargement de la page…");
  });

  it("s'affiche aussi pendant une soumission de formulaire", () => {
    state.current = "submitting";
    render(<NavigationProgress />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("disparaît dès le retour au repos", () => {
    state.current = "loading";
    const view = render(<NavigationProgress />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("status")).toBeTruthy();

    state.current = "idle";
    view.rerender(<NavigationProgress />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
