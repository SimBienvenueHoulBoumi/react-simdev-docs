// Pourquoi : verrouille le contrat du traçage des hooks du banc (§7) —
// le Tracker échantillonne les valeurs successives, l'instrumentation
// remplace chaque objet react-like sans toucher aux composants, et le
// HookMonitor rend l'état en direct. Une régression ici rendrait « l'état
// des données à chaque moment » muet — c'est la fonctionnalité demandée.

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HookMonitor, Tracker, instrumentScope } from "~/components/layout/bench-panel";

describe("Tracker — état des données à chaque moment", () => {
  it("prolonge l'historique d'un hook au fil des rendus (beginRender)", () => {
    const tracker = new Tracker();
    tracker.push("useState", "A");
    tracker.beginRender(); // passe suivante (déclenchée par le setter)
    tracker.push("useState", "A"); // rendu sans changement → ignoré
    tracker.beginRender();
    tracker.push("useState", "Ali");
    tracker.flush();

    expect(tracker.snapshot()).toEqual([
      { name: "useState[0]", values: ["A", "Ali"] },
    ]);
  });

  it("fusionne la re-passe identique de StrictMode (une seule séquence enregistrée)", () => {
    const tracker = new Tracker();
    // Passe 1 du double-rendu (montage StrictMode) : la rafale complète
    tracker.push("useState", "A");
    tracker.push("useState", false);
    tracker.push("useMemo", 6);
    // Passe 2, strictement identique, sans beginRender entre les deux
    tracker.push("useState", "A");
    tracker.push("useState", false);
    tracker.push("useMemo", 6);
    tracker.flush();

    expect(tracker.snapshot()).toEqual([
      { name: "useState[0]", values: ["A"] },
      { name: "useState[1]", values: ["false"] },
      { name: "useMemo[0]", values: ["6"] },
    ]);
  });

  it("numérote les appels distincts d'un hook dans une même passe (useState[0], useState[1]…)", () => {
    const tracker = new Tracker();
    tracker.push("useState", 1);
    tracker.push("useState", 2);
    tracker.push("useMemo", 6);
    tracker.flush();

    expect(tracker.snapshot().map((t) => t.name)).toEqual([
      "useState[0]",
      "useState[1]",
      "useMemo[0]",
    ]);
  });

it("serialise les valeurs non-strings (objets JSON, fonctions, null)", () => {
    const tracker = new Tracker();
    tracker.push("useState", { count: 2 });
    tracker.beginRender();
    tracker.push("useState", null);
    tracker.beginRender();
    tracker.push("useCallback", () => {});
    tracker.flush();

    const hook = tracker.snapshot();
    expect(hook[0].values).toEqual(['{"count":2}', "null"]);
    expect(hook[1].values).toEqual(["[fn]"]);
  });

  it("reset() vide l'état et notifie les abonnés", () => {
    const tracker = new Tracker();
    let notified = 0;
    const unsubscribe = tracker.subscribe(() => notified++);

    tracker.push("useState", "x");
    tracker.flush(); // le commit émet (pas le push)
    tracker.reset();
    unsubscribe();

    expect(notified).toBe(2);
    expect(tracker.isEmpty).toBe(true);
    expect(tracker.snapshot()).toEqual([]);
  });

  it("getSnapshot change à chaque échantillon (contrat useSyncExternalStore)", () => {
    const tracker = new Tracker();
    const before = tracker.getSnapshot();
    tracker.push("useState", "a");
    tracker.flush();
    expect(tracker.getSnapshot()).not.toBe(before);
  });
});

describe("instrumentScope — instrumentation des objets react-like", () => {
  it("traque useState, useReducer et useMemo à l'appel", () => {
    const tracker = new Tracker();
    const fakeReact = {
      useState: (i: unknown) => [i, () => {}],
      useReducer: (_: unknown, i: unknown) => [i, () => {}],
      useMemo: (f: () => unknown) => f(),
      Suspense: "Suspense",
    };
    const scope = instrumentScope({ React: fakeReact, cn: "cn" }, tracker);

    (scope.React as { useState: (i: unknown) => unknown }).useState("Alice");
    (scope.React as { useReducer: (r: unknown, i: unknown) => unknown }).useReducer(null, { open: true });
    (scope.React as { useMemo: (f: () => unknown) => unknown }).useMemo(() => 42);
    tracker.flush();

    expect(tracker.snapshot()).toEqual([
      { name: "useState[0]", values: ["Alice"] },
      { name: "useReducer[0]", values: ['{"open":true}'] },
      { name: "useMemo[0]", values: ["42"] },
    ]);
  });

  it("laisse passer les valeurs non react-like et copie le reste du module", () => {
    const tracker = new Tracker();
    const scope = instrumentScope({ Button: "Component", cn: "cn" }, tracker);
    expect(scope.Button).toBe("Component");
    const ReactScope = { useState: () => [0, () => {}], createElement: "ce" };
    const traced = instrumentScope({ ReactScope }, tracker);
    expect(traced.ReactScope).not.toBe(ReactScope);
    expect((traced.ReactScope as Record<string, unknown>).createElement).toBe("ce");
  });
});

describe("HookMonitor — affichage de l'état", () => {
  it("rend chaque hook avec valeur courante et historique", () => {
    const tracker = new Tracker();
    act(() => {
      tracker.push("useState", "A");
      tracker.beginRender(); // passe suivante
      tracker.push("useState", "Ali");
      tracker.flush();
    });

    render(<HookMonitor tracker={tracker} />);

    expect(screen.getByText("useState[0]")).toBeTruthy();
    expect(screen.getByText("Ali")).toBeTruthy();
    expect(screen.getByText("A →")).toBeTruthy();
  });

  it("affiche l'état vide lorsque rien n'a été exécuté", () => {
    const tracker = new Tracker();
    render(<HookMonitor tracker={tracker} />);
    expect(screen.getByText(/aucun hook/)).toBeTruthy();
  });

  it("re-rend quand un échantillon est poussé (useSyncExternalStore)", async () => {
    const tracker = new Tracker();
    const view = render(<HookMonitor tracker={tracker} />);
    expect(view.queryByText("Bonjour")).toBeNull();

    act(() => {
      tracker.push("useState", "Bonjour");
      tracker.flush();
    });
    expect(screen.getByText("Bonjour")).toBeTruthy();
  });
});