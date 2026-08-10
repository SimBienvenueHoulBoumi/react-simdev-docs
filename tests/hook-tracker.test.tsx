// Pourquoi : verrouille le contrat du traçage des hooks du banc (design §5).
// Le Tracker regroupe les échantillons par PASSE DE RENDU, retient QUI a
// déclenché chaque passe, et nomme les hooks par leur vraie variable quand
// l'appariement est sûr. Une régression ici rendrait le mécanisme des hooks
// de nouveau invisible — c'est la fonctionnalité demandée.

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HookMonitor, Tracker, instrumentScope } from "~/components/layout/bench-panel";
import { extractHookNames } from "~/components/layout/bench-hook-names";

describe("Tracker — les passes de rendu", () => {
  it("numérote les passes à partir de 1 et n'a pas de déclencheur au montage", () => {
    const tracker = new Tracker();
    tracker.push("useState", "A");
    tracker.beginRender("setNom");
    tracker.push("useState", "Ali");
    tracker.flush();

    const passes = tracker.snapshot();
    expect(passes.map((p) => p.index)).toEqual([1, 2]);
    expect(passes[0].trigger).toBeNull();
    expect(passes[1].trigger).toBe("setNom");
  });

  it("marque `changed` par comparaison avec la même position à la passe précédente", () => {
    const tracker = new Tracker();
    tracker.push("useState", 0);
    tracker.beginRender("setC");
    tracker.push("useState", 1);
    tracker.beginRender("setC");
    tracker.push("useState", 1); // ré-rendu sans changement de valeur
    tracker.flush();

    const passes = tracker.snapshot();
    // Au montage rien n'a « changé » : tout naît.
    expect(passes[0].samples[0].changed).toBe(false);
    expect(passes[1].samples[0].changed).toBe(true);
    expect(passes[2].samples[0].changed).toBe(false);
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

    const passes = tracker.snapshot();
    expect(passes).toHaveLength(1);
    expect(passes[0].samples.map((s) => `${s.name}=${s.value}`)).toEqual([
      "useState[0]=A",
      "useState[1]=false",
      "useMemo[0]=6",
    ]);
  });

  it("numérote les appels distincts d'un hook dans une même passe", () => {
    const tracker = new Tracker();
    tracker.push("useState", 1);
    tracker.push("useState", 2);
    tracker.push("useMemo", 6);
    tracker.flush();

    expect(tracker.snapshot()[0].samples.map((s) => s.name)).toEqual([
      "useState[0]",
      "useState[1]",
      "useMemo[0]",
    ]);
  });

  it("serialise les valeurs non-strings (objets JSON, fonctions, null)", () => {
    const tracker = new Tracker();
    tracker.push("useState", { count: 2 });
    tracker.push("useCallback", () => {});
    tracker.beginRender("setC");
    tracker.push("useState", null);
    tracker.push("useCallback", () => {});
    tracker.flush();

    const passes = tracker.snapshot();
    expect(passes[0].samples.map((s) => s.value)).toEqual(['{"count":2}', "[fn]"]);
    expect(passes[1].samples[0].value).toBe("null");
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

describe("Tracker — nommage par la vraie variable", () => {
  it("nomme les hooks d'après le code du banc", () => {
    const tracker = new Tracker();
    tracker.setNaming(
      extractHookNames(`
        const [count, setCount] = useState(0);
        const square = useMemo(() => count * count, [count]);
      `),
    );
    tracker.push("useState", 0);
    tracker.push("useMemo", 0);
    tracker.flush();

    expect(tracker.snapshot()[0].samples.map((s) => s.name)).toEqual(["count", "square"]);
  });

  it("résout le nom du setter, qui devient le déclencheur de la passe suivante", () => {
    const tracker = new Tracker();
    tracker.setNaming(extractHookNames(`const [count, setCount] = useState(0);`));

    const index = tracker.push("useState", 0);
    expect(tracker.setterName("useState", index)).toBe("setCount");

    tracker.beginRender(tracker.setterName("useState", index));
    tracker.push("useState", 1);
    tracker.flush();

    expect(tracker.snapshot()[1].trigger).toBe("setCount");
  });

  it("retombe sur les index quand le nommage n'est pas sûr (deux composants)", () => {
    const tracker = new Tracker();
    tracker.setNaming(
      extractHookNames(`
        function Parent() { const [a, setA] = useState(0); return <Child />; }
        function Child() { const [b, setB] = useState(""); return null; }
      `),
    );
    tracker.push("useState", 0);
    tracker.push("useState", "");
    tracker.flush();

    expect(tracker.snapshot()[0].samples.map((s) => s.name)).toEqual([
      "useState[0]",
      "useState[1]",
    ]);
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

    expect(tracker.snapshot()[0].samples.map((s) => `${s.name}=${s.value}`)).toEqual([
      "useState[0]=Alice",
      'useReducer[0]={"open":true}',
      "useMemo[0]=42",
    ]);
  });

  it("le setter instrumenté ouvre une nouvelle passe", () => {
    const tracker = new Tracker();
    const fakeReact = { useState: (i: unknown) => [i, () => {}] };
    const scope = instrumentScope({ React: fakeReact }, tracker);
    const useState = (scope.React as { useState: (i: unknown) => [unknown, () => void] }).useState;

    const [, setValue] = useState(0);
    act(() => setValue());
    useState(1);
    tracker.flush();

    expect(tracker.snapshot()).toHaveLength(2);
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

describe("HookMonitor — la chronologie", () => {
  it("rend une colonne par passe, avec son déclencheur", () => {
    const tracker = new Tracker();
    tracker.setNaming(extractHookNames(`const [nom, setNom] = useState("A");`));
    act(() => {
      tracker.push("useState", "A");
      tracker.beginRender("setNom");
      tracker.push("useState", "Ali");
      tracker.flush();
    });

    render(<HookMonitor tracker={tracker} />);

    expect(screen.getByText("Rendu #1")).toBeTruthy();
    expect(screen.getByText("montage")).toBeTruthy();
    expect(screen.getByText("Rendu #2")).toBeTruthy();
    expect(screen.getByText("← setNom")).toBeTruthy();
    expect(screen.getAllByText("nom")).toHaveLength(2);
    expect(screen.getByText("Ali")).toBeTruthy();
  });

  it("annonce « inchangé » quand une valeur survit à un rendu", () => {
    const tracker = new Tracker();
    act(() => {
      tracker.push("useState", "A");
      tracker.beginRender("setAutre");
      tracker.push("useState", "A");
      tracker.flush();
    });

    render(<HookMonitor tracker={tracker} />);
    expect(screen.getByText(/inchangé/)).toBeTruthy();
  });

  it("affiche l'état vide lorsque rien n'a été exécuté", () => {
    const tracker = new Tracker();
    render(<HookMonitor tracker={tracker} />);
    expect(screen.getByText(/aucun hook/)).toBeTruthy();
  });

  it("re-rend quand un échantillon est poussé (useSyncExternalStore)", () => {
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
