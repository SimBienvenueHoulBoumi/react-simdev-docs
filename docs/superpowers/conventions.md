# Conventions — react-foundry

Règles de la banque de composants. La spec de conception (2026-08-10-react-foundry-design.md) décrit le quoi ; ce fichier décrit le comment. Toute contribution au catalogue doit passer ces règles — vérifiables par revue, grep et tests.

## 1. Découpage

- **Un composant = un fichier autonome** dans `app/components/ui/<nom>.tsx`, copiable tel quel (critère d'acceptation 1).
- Deux variantes par composant : `ui/tw/<nom>.tsx` (Tailwind pur) et `ui/mui/<nom>.tsx` (MUI pur). **Aucun mélange** : un fichier tw n'importe jamais MUI ni `cn` vers des classes MUI ; un fichier mui n'importe jamais `~/lib/cn` ni des classes Tailwind codées en dur.
- La **façade** `ui/<nom>.tsx` ne contient que le dispatch : `<EngineSwitch tailwind={<Tw/>} mui={<Mui/>} />`. Pas de logique, pas de `cn`.
- Toujours hors de `components/` : `react-router`, `fetch`, `localStorage`, tout ce qui lie à l'app. Les composants restent purs (critère d'acceptation 2).

## 2. Contrat de props (spec §5.2)

- Les mêmes noms partout, sans exception : `variant`, `size`, `isLoading`, `className`, `as`, `onValueChange`. Jamais `kind` sur un composant et `variant` sur un autre, jamais `loading` à côté de `isLoading`.
- **`className` est toujours acceptée et fusionnée** (via `cn` côté tw, `sx`/`className` côté mui).
- `isLoading` désactive le composant ET pose `aria-disabled` — c'est l'anti double-clic.
- Types explicites ; aucun `any` dans `ui/`.
- Les variantes déclarées dans l'interface doivent être **consommées** : une prop fantôme (déclarée mais jamais utilisée) est un bug de contrat.

## 3. Contrat de données (spec §5.1)

- Un composant de la banque ne connaît jamais la forme des données : accesseurs `getKey`, `renderItem`, render props.
- Deux formes de données radicalement différentes par fiche générique — c'est la preuve d'adaptabilité.

## 4. Tokens et thème

- Les composants n'utilisent **que** les noms sémantiques de `app.css` (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`…) — jamais de couleurs brutes (hex, gray-*, oklch).
- Les couleurs codées en dur cassent le mode nuit : c'est un bug, pas un choix.
- MUI suit la classe `.dark` via `app/lib/mui-theme.tsx` (MutationObserver) — ne jamais poser de variante claire en dur dans un composant mui.
- Toute bascule d'état global (moteur, thème) passe par `useSyncExternalStore` + un événement custom — jamais `useState(readInitial)` qui ignore l'hydration (bug « le choix ne persiste pas »).

## 5. Ajouter une entrée au catalogue

Coût d'ajout : **un fichier + une ligne** (spec §6.5).

1. Créer `app/foundry/entries/<slug>.tsx` — import `?raw` du code réel (jamais de chaîne dupliquée, critère 4), `Entry` avec `Doc` au gabarit (spec §6.6).
2. Ajouter l'import + l'entrée dans `app/foundry/registry.ts`.
3. Vérifier : `npm run typecheck` (une entrée invalide casse au typecheck, pas au runtime), `npm run build`, et le rendu SSR de la route.
4. Les notions ont une seule `source` ; les primitives deux (`sourceTw`/`sourceMui`) avec onglets.

## 6. Moteur de style

- `StyleEngineProvider` (racine) → `useStyleEngine()` + `EngineSwitch`.
- Persisté dans `localStorage["foundry-engine"]` ; le SSR rend toujours `tailwind`, le client re-rend si la valeur stockée diffère.
- **Le sélecteur doit rester accessible partout** : il est dans la barre haute (≥ 640px) et dans le tiroir mobile — un choix persisté ne doit jamais devenir impossible à annuler.

## 7. Tests (spec §12)

- `npm test` — Vitest + Testing Library, jsdom.
- Quatre strates : primitive (variantes, disabled, clavier), générique (deux formes de données), formulaire à action (succès/erreur serveur), test de fumée (chaque fichier de `ui/tw` et `ui/mui` s'importe isolément et exporte le composant attendu).
- Les composants qui passent par `EngineSwitch` (façades) exigent `<StyleEngineProvider>` dans le test.

## 8. Erreurs courantes (spec §9.7)

- Les `errors` d'une entrée sont indexées par la recherche ⌘K : coller un message React mène à sa fiche. Compléter le `errors` de l'entrée concernée plutôt que de créer une fiche.

## 9. Accessibilité

- Éléments natifs prioritaires (`<button>`, `<input>`) — la navigation clavier est gratuite.
- `aria-disabled` quand un composant est visuellement inactif, `disabled` quand l'action est vraiment bloquée.
- `role="alert"` pour les erreurs, `role="status"` pour les confirmations.
- Le dark mode est une exigence : chaque nouveau composant se vérifie en clair ET en sombre.

## 10. Écrire une expérience de banc d'essai

Une fiche peut fournir des **expériences commutables** (`BenchSection experiments={…}`) : chacune isole UN mécanisme et porte sa thèse en clair.

- **Un seul composant à hooks par expérience.** C'est la condition du nommage : le panneau apparie les noms de variables par ordre textuel, ce qui n'est fiable qu'avec un composant unique. Dès qu'il y en a deux, il retombe volontairement sur `useState[0]` plutôt que de risquer un nom faux (design §5.2).
- **Une thèse, pas une description.** « Sans `useState`, React ne rend rien » — une phrase que l'expérience prouve, pas un résumé de ce qu'elle contient.
- **`id` en kebab-case** : il devient l'ancre `#banc-<id>`, sélectionnable depuis le sommaire et partageable par URL.
- Le code suit le contrat d'exécution du banc (spec §7) : soit une expression de rendu seule, soit un programme avec `return` de premier niveau.

## 11. Ancres de sommaire

Le sommaire de droite est un **miroir vivant du DOM** (`MutationObserver` sur `<main>`) : il indexe les `h2[id]` / `h3[id]` **et** tout élément portant `data-toc` + `id`, qui entre alors au niveau 3 avec `data-toc` pour libellé.

Utiliser `data-toc` pour rendre navigable ce qui n'est pas un titre (onglets, sections commutables). Ne jamais inventer un titre invisible pour créer une ancre.