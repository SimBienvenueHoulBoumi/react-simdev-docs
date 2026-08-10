// Pourquoi : verrouille le sommaire VIVANT (spec §6) — un titre ajouté après
// le montage doit entrer dans le sommaire (MutationObserver + requestAnimation
// Frame), une ancre [data-toc][id] est indexée au niveau 3, et deux scans
// identiques n'appellent le setter qu'une fois (garde-fou anti-boucle).
// On teste la logique de PRODUCTION (toc-scan.ts, utilisé par $slug.tsx) —
// pas une copie. Le rAF est ramené à un setTimeout(0) sous fake timers.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scanToc, tocSignature, watchToc } from "~/components/layout/toc-scan";
import type { TocItem } from "~/components/layout/table-of-contents";

// jsdom ne fournit pas de rAF pilotable : on le remplace par un setTimeout(0)
// pour rester maître du déclenchement via vi.runAllTimers().
function stubRaf() {
  vi.stubGlobal(
    "requestAnimationFrame",
    (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0) as unknown as number,
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
}

beforeEach(() => {
  vi.useFakeTimers();
  stubRaf();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("sommaire — scanToc (spec §6.2)", () => {
  it("indexe h2 et h3 à leur niveau, avec leur texte", () => {
    const main = document.createElement("main");
    main.innerHTML = `<h2 id="a">Titre A</h2><h3 id="b">Titre B</h3>`;
    expect(scanToc(main)).toEqual([
      { id: "a", label: "Titre A", level: 2 },
      { id: "b", label: "Titre B", level: 3 },
    ]);
  });

  it("indexe une ancre [data-toc][id] au niveau 3, avec son libellé d'attribut", () => {
    const main = document.createElement("main");
    main.innerHTML = `<span id="banc-la-memoire" data-toc="La mémoire">contenu non-titre</span>`;
    expect(scanToc(main)).toEqual([
      { id: "banc-la-memoire", label: "La mémoire", level: 3 },
    ]);
  });

  it("ignore les titres sans id", () => {
    const main = document.createElement("main");
    main.innerHTML = `<h2>Sans ancre</h2><h3 id="seul">Seul</h3>`;
    expect(scanToc(main)).toEqual([{ id: "seul", label: "Seul", level: 3 }]);
  });
});

describe("sommaire — MutationObserver + requestAnimationFrame (spec §6.1)", () => {
  it("fait entrer dans le sommaire un titre ajouté APRÈS le montage", async () => {
    const main = document.createElement("main");
    main.innerHTML = `<h2 id="deja-la">Déjà là</h2>`;
    const onItems = vi.fn();
    const detach = watchToc(main, onItems);

    // Scan immédiat au montage
    expect(onItems).toHaveBeenCalledTimes(1);
    expect(onItems).toHaveBeenLastCalledWith([
      { id: "deja-la", label: "Déjà là", level: 2 },
    ]);

    // Un titre arrive après le montage (banc déplié, contenu paresseux…)
    const titre = document.createElement("h3");
    titre.id = "nouveau";
    titre.textContent = "Nouveau venu";
    main.appendChild(titre);

    // La mutation est traitée à la prochaine frame (microtask jsdom + timer)
    await vi.runAllTimersAsync();
    expect(onItems).toHaveBeenCalledTimes(2);
    expect(onItems).toHaveBeenLastCalledWith([
      { id: "deja-la", label: "Déjà là", level: 2 },
      { id: "nouveau", label: "Nouveau venu", level: 3 },
    ]);

    detach();
  });

  it("ne rappelle pas le setter quand le scan ne change pas — pas de boucle", async () => {
    const main = document.createElement("main");
    main.innerHTML = `<h2 id="a">A</h2>`;
    const onItems = vi.fn();
    const detach = watchToc(main, onItems);
    expect(onItems).toHaveBeenCalledTimes(1);

    // Mutation sans incidence sur le sommaire (aucune ancre ajoutée) :
    // deux scans identiques → un seul appel, sinon setToc → re-rendu →
    // mutation → setToc… la boucle ne s'arrêterait jamais.
    for (let i = 0; i < 3; i++) {
      const filler = document.createElement("div");
      filler.textContent = `bruit sans ancre n°${i}`;
      main.appendChild(filler);
      await vi.runAllTimersAsync();
    }

    expect(onItems).toHaveBeenCalledTimes(1);
    detach();
  });
});

describe("sommaire — signature anti-boucle", () => {
  it("distingue les items par level|id|label", () => {
    const base: TocItem[] = [{ id: "banc", label: "Le cache", level: 3 }];
    const autreNiveau: TocItem[] = [{ id: "banc", label: "Le cache", level: 2 }];
    const autreLibelle: TocItem[] = [{ id: "banc", label: "Le rendu", level: 3 }];
    const autreId: TocItem[] = [{ id: "rendu", label: "Le cache", level: 3 }];

    expect(tocSignature(base)).not.toBe(tocSignature(autreNiveau));
    expect(tocSignature(base)).not.toBe(tocSignature(autreLibelle));
    expect(tocSignature(base)).not.toBe(tocSignature(autreId));
    expect(tocSignature(base)).toBe(tocSignature(base));
  });
});