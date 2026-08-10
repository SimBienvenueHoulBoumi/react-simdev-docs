// Pourquoi : la logique « sommaire vivant » de la route fiche (spec §6).
// Le sommaire est un miroir du DOM : on scanne les ancres au montage PUIS à
// chaque mutation de <main>, en requestAnimationFrame. Le garde-fou par
// signature (level|id|label) empêche la boucle setToc → re-rendu → mutation.
// Module pur et testable sans routeur — la route foundry/$slug l'installe.

import type { TocItem } from "./table-of-contents";

/** Ancres indexées : h2/h3 avec id, plus tout élément `[data-toc][id]`.
 *  Le label d'un `[data-toc]` vient de l'attribut, sinon du texte ; son
 *  niveau est 3 (spec §6.2). */
export function scanToc(main: ParentNode): TocItem[] {
  const nodes = Array.from(
    main.querySelectorAll<HTMLElement>("h2[id], h3[id], [data-toc][id]"),
  );
  return nodes.map((el) => ({
    id: el.id,
    label: el.dataset.toc ?? el.textContent ?? "",
    level: el.dataset.toc ? 3 : el.tagName === "H2" ? 2 : 3,
  }));
}

/** Signature anti-boucle : une mutation sans changement du sommaire ne doit
 *  pas re-déclencher setToc (spec §6.1). */
export function tocSignature(items: TocItem[]): string {
  return items.map((i) => `${i.level}|${i.id}|${i.label}`).join("\n");
}

/** Installe le sommaire vivant sur `main` : scan immédiat puis
 *  MutationObserver déclenché en requestAnimationFrame, protégé par signature.
 *  Renvoie le détach (observateur + frame) pour le cleanup du useEffect. */
export function watchToc(
  main: ParentNode,
  onItems: (items: TocItem[]) => void,
): () => void {
  let frame = 0;
  let signature = "";

  const scan = () => {
    const items = scanToc(main);
    const next = tocSignature(items);
    if (next === signature) return;
    signature = next;
    onItems(items);
  };

  scan();
  const observer = new MutationObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(scan);
  });
  observer.observe(main, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["id", "data-toc"],
  });

  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
  };
}