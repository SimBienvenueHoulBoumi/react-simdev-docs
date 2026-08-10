// Pourquoi : rendre le sommaire disponible DÈS LE SSR.
//
// Le sommaire était dérivé du DOM après hydratation : sur une connexion lente,
// le contenu s'affichait puis la colonne de droite restait vide le temps que le
// JS arrive. Ici on lit les sections directement dans l'arbre d'éléments que
// renvoie le `Doc` de la fiche — sans rendre les enfants, donc sans DOM.
//
// C'est possible parce que le gabarit (spec §6.6) est fermé : chaque bloc de
// sheet.tsx a un titre et une ancre fixes, connus à l'avance. Les fiches n'ont
// rien à déclarer, rien à maintenir en double.
//
// Limite assumée : les ancres qui n'existent qu'à l'exécution (les expériences
// du banc, chargé à la demande) ne peuvent pas être connues du serveur. Le scan
// DOM vivant les ajoute après hydratation et prend alors le relais.

import { isValidElement, type ComponentType, type ReactNode } from "react";
import type { TocItem } from "~/components/layout/table-of-contents";
import {
  AdaptationAxes,
  BenchSection,
  Code,
  Concept,
  DataContract,
  Facts,
  Pitfalls,
  Preview,
  SheetSection,
  SheetSubSection,
  WhenToUse,
} from "./sheet";

/** Les blocs du gabarit et l'ancre qu'ils émettent. Doit rester synchrone avec
 *  les `SheetSection` de sheet.tsx — un test le verrouille. */
const BLOCS = new Map<unknown, { id: string; title: string }>([
  [Concept, { id: "concept", title: "Le concept en trois lignes" }],
  [Preview, { id: "apercu", title: "Aperçu" }],
  [Code, { id: "code", title: "Code" }],
  [DataContract, { id: "contrat-donnees", title: "Contrat de données" }],
  [WhenToUse, { id: "quand-utiliser", title: "Quand l'utiliser / quand surtout pas" }],
  [AdaptationAxes, { id: "adaptation", title: "Axes d'adaptation" }],
  [BenchSection, { id: "banc-essai", title: "Banc d'essai" }],
  [Pitfalls, { id: "pieges", title: "Pièges" }],
  [Facts, { id: "prerequis", title: "Prérequis & accessibilité" }],
]);

function collect(node: ReactNode, out: TocItem[]): void {
  if (Array.isArray(node)) {
    for (const child of node) collect(child, out);
    return;
  }
  if (!isValidElement(node)) return;

  const props = node.props as { id?: string; title?: string; children?: ReactNode };

  // Sections libres : la fiche fournit elle-même id et titre.
  if (node.type === SheetSection && props.id && props.title) {
    out.push({ id: props.id, label: props.title, level: 2 });
  } else if (node.type === SheetSubSection && props.id && props.title) {
    out.push({ id: props.id, label: props.title, level: 3 });
  } else {
    const connu = BLOCS.get(node.type);
    // Preview accepte un id personnalisé ; les autres blocs ont une ancre fixe.
    if (connu) out.push({ id: props.id ?? connu.id, label: connu.title, level: 2 });
  }

  // On ne descend que dans ce qui n'est pas déjà une section : les enfants d'un
  // bloc sont son contenu (paragraphes, listes), pas d'autres sections.
  if (!estUnBloc(node.type) && props.children) collect(props.children, out);
}

function estUnBloc(type: unknown): boolean {
  return BLOCS.has(type) || type === SheetSection || type === SheetSubSection;
}

/**
 * Sections d'une fiche, lues sans rendu ni DOM — utilisable au SSR.
 *
 * `Doc()` est appelé hors cycle React : une fiche dont le `Doc` appelle un hook
 * au premier niveau lèvera. On renvoie alors une liste vide et le scan DOM
 * vivant reprend la main après hydratation — dégradé, jamais faux.
 */
export function sectionsFromDoc(Doc: ComponentType): TocItem[] {
  try {
    const tree = (Doc as () => ReactNode)();
    const out: TocItem[] = [];
    collect(tree, out);
    return out;
  } catch {
    return [];
  }
}
