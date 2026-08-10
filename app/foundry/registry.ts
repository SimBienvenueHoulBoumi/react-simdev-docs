// Pourquoi : source de vérité unique du catalogue (spec §6.5).
// Ajouter une entrée = créer un fichier entries/xxx.tsx + une ligne ici.

import { type ComponentType } from "react";

export type Level = "base" | "intermediaire" | "avance";
export type Family =
  | "fondations"
  | "primitives"
  | "notions"
  | "donnees"
  | "formulaires"
  | "recettes";

export interface Entry {
  slug: string;
  title: string;
  family: Family;
  level: Level;
  /** Une phrase, affichée dans la nav et la recherche */
  summary: string;
  /** Phrases « Je veux… » pour l'index par intention (§6.4) */
  intents: string[];
  /** Code réel importé via ?raw — ne peut pas diverger du fichier (§6.7).
   *  Implémentation unique (notions, recettes, patterns). */
  source?: string;
  /** Implémentation Tailwind pure (?raw) — les primitives ont deux variantes */
  sourceTw?: string;
  /** Implémentation MUI pure (?raw) */
  sourceMui?: string;
  /** Dépendances à copier avec ({'lib/cn.ts', …}) */
  deps: string[];
  /** Slugs des notions employées → liens croisés (§6.3) */
  uses: string[];
  /** Noms de props indexés par la recherche */
  props?: string[];
  /** Messages d'erreur React associés (recherche par collage, §9.7) */
  errors?: string[];
  /** Contenu de la fiche */
  Doc: ComponentType;
}

export const FAMILY_LABELS: Record<Family, string> = {
  fondations: "Fondations",
  primitives: "Primitives",
  notions: "Notions",
  donnees: "Données",
  formulaires: "Formulaires",
  recettes: "Recettes",
};

export const LEVEL_LABELS: Record<Level, string> = {
  base: "bases",
  intermediaire: "intermédiaire",
  avance: "avancé",
};

export const FAMILY_ORDER: Family[] = [
  "fondations",
  "primitives",
  "notions",
  "donnees",
  "formulaires",
  "recettes",
];

// ——— Entrées (une ligne par fiche) ———
import { ButtonEntry } from "./entries/button";
import { InputEntry } from "./entries/input";
import { SelectEntry } from "./entries/select";
import { TextareaEntry } from "./entries/textarea";
import { CheckboxEntry } from "./entries/checkbox";
import { BadgeEntry } from "./entries/badge";
import { CardEntry } from "./entries/card";
import { AvatarEntry } from "./entries/avatar";
import { DialogEntry } from "./entries/dialog";
import { ToastEntry } from "./entries/toast";
import { SkeletonEntry } from "./entries/skeleton";
import { DataListEntry } from "./entries/data-list";
import { EmptyStateEntry } from "./entries/empty-state";
import { FieldEntry } from "./entries/field";
import { KeysNotion } from "./entries/notion-keys";
import { PropsNotion } from "./entries/notion-props";
import { StateNotion } from "./entries/notion-state";
import { EffectsNotion } from "./entries/notion-effects";
import { FormsNotion } from "./entries/notion-forms";
import { LiftingNotion } from "./entries/notion-lifting";
import { PolymorphismNotion } from "./entries/notion-polymorphism";
import { CustomHooksNotion } from "./entries/notion-custom-hooks";
import { ContextNotion } from "./entries/notion-context";
import { EventsNotion } from "./entries/notion-events";
import { ConditionalNotion } from "./entries/notion-conditional";
import { MemoNotion } from "./entries/notion-memo";
import { RefNotion } from "./entries/notion-ref";
import { ChildrenNotion } from "./entries/notion-children";
import { ErrorBoundaryNotion } from "./entries/notion-error-boundary";
import { PortalNotion } from "./entries/notion-portal";
import { ReducerNotion } from "./entries/notion-reducer";
import { CompoundNotion } from "./entries/notion-compound";
import { SuspenseNotion } from "./entries/notion-suspense";
import { TransitionNotion } from "./entries/notion-transition";
import { ActionStateNotion } from "./entries/notion-action-state";
import { UseFnNotion } from "./entries/notion-use-fn";
import { VirtualizationNotion } from "./entries/notion-virtualization";
import { UrlFiltersRecipe } from "./entries/recipe-url-filters";
import { ApiErrorRecipe } from "./entries/recipe-api-error";

export const entries: Entry[] = [
  ButtonEntry,
  InputEntry,
  SelectEntry,
  TextareaEntry,
  CheckboxEntry,
  BadgeEntry,
  CardEntry,
  AvatarEntry,
  DialogEntry,
  ToastEntry,
  SkeletonEntry,
  DataListEntry,
  EmptyStateEntry,
  FieldEntry,
  KeysNotion,
  PropsNotion,
  StateNotion,
  EffectsNotion,
  FormsNotion,
  LiftingNotion,
  PolymorphismNotion,
  CustomHooksNotion,
  ContextNotion,
  EventsNotion,
  ConditionalNotion,
  MemoNotion,
  RefNotion,
  ChildrenNotion,
  ErrorBoundaryNotion,
  PortalNotion,
  ReducerNotion,
  CompoundNotion,
  SuspenseNotion,
  TransitionNotion,
  ActionStateNotion,
  UseFnNotion,
  VirtualizationNotion,
  UrlFiltersRecipe,
  ApiErrorRecipe,
];

export const entryBySlug = new Map(entries.map((e) => [e.slug, e]));

export const FAMILIES: Family[] = FAMILY_ORDER.filter((f) =>
  entries.some((e) => e.family === f),
);