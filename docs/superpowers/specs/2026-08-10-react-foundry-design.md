# react-foundry — Design

**Date** : 2026-08-10
**Statut** : validé, prêt pour plan d'implémentation

---

## 1. Intention

Constituer une **banque de composants React** réutilisables et adaptables : on vient chercher un composant ou une notion, on comprend le concept, on copie le code, on l'adapte à ses propres données.

Ce n'est **pas** une bibliothèque. Rien à installer, rien à versionner. Le code copié appartient à celui qui le copie, qui le modifie sans contrainte. Modèle de distribution : le copier-coller (comme shadcn/ui).

Le delta face à react.dev : la doc officielle explique une API isolée dans un exemple jetable. Ici, chaque notion est incarnée par un composant réel, testable en direct, copiable, et branché sur des données.

## 2. Non-objectifs

Exclus délibérément pour que le projet reste finissable :

- Publication npm, `dist/`, versioning, CLI d'installation
- API de theming abstraite (`<ThemeProvider>`, objet de config) — on édite les classes Tailwind
- Barrels `index.ts` (ils n'ont de sens que pour une API publique)
- i18n, support RTL, bibliothèque d'animations
- Compatibilité multi-frameworks (Vue, Svelte)
- Exhaustivité façon react.dev en v1 — on construit l'usine, on la remplit en continu

## 3. Public cible et critère de réussite

**Cible** : une personne qui maîtrise JS/TS et a lu la doc React, mais qui bloque sur le trajet entre « j'ai compris » et « ça tourne dans mon projet ».

**Critère de réussite** : cette personne trouve ce qu'elle cherche en moins de 30 secondes, colle le code dans son projet, et ça compile du premier coup.

**Corollaire non négociable** : un composant qui ne survit pas au copier-coller n'entre pas dans la banque. Si la promesse casse une fois, la confiance dans le dépôt est perdue.

## 4. Architecture

### 4.1 Les trois couches

| Couche | Dossier | Connaît | Ne connaît jamais |
|---|---|---|---|
| Présentation | `app/components/` | ses props | `react-router`, `fetch`, l'état global |
| Branchement | `app/routes/` | `loader`, `action`, l'URL | le HTTP brut |
| Transport | `app/lib/api/` | HTTP, endpoints, erreurs | le JSX |

### 4.2 Règle d'or

**Un composant de la banque n'importe jamais `react-router` ni `fetch`.**

Il reçoit `items` en props, pas `useLoaderData()`. Conséquence : le même composant fonctionne avec un loader React Router, TanStack Query, un mock ou une API REST — et se colle dans n'importe quel projet React (Next, Vite nu, Remix).

Le branchement aux données vit exclusivement dans les fichiers de `app/routes/`.

### 4.3 Arborescence

```
app/
├── app.css                     # tokens Tailwind 4 (@theme) + dark mode
├── root.tsx
├── routes.ts
├── components/
│   ├── ui/                     # primitives pures, un fichier autonome par composant
│   ├── patterns/               # blocs composés purs (data-list, empty-state, field…)
│   └── layout/                 # shell applicatif
├── lib/
│   ├── api/
│   │   ├── types.ts            # interfaces du domaine
│   │   ├── client.ts           # fetch typé + normalisation des erreurs
│   │   ├── mock.ts             # adaptateur mock (latence, erreurs déclenchables)
│   │   └── tasks.ts            # endpoints métier
│   └── cn.ts                   # merge de classes (~5 lignes)
├── features/tasks/             # composants métier : connaissent le domaine, pas le transport
├── routes/
│   ├── home.tsx
│   ├── tasks.tsx               # loader/action → passe des props
│   └── foundry/                # le catalogue
│       ├── layout.tsx          # la grille 3 colonnes
│       ├── index.tsx           # index par intention
│       └── $slug.tsx           # une fiche
└── foundry/
    ├── registry.ts             # source de vérité du catalogue
    └── entries/                # une entrée = un fichier (démo + métadonnées)
```

## 5. Contrats

### 5.1 Contrat de données

**Un composant de la banque ne connaît jamais la forme des données.** Il est générique et reçoit des accesseurs ou des render props.

À rejeter — figé sur un domaine :

```tsx
<TaskList tasks={tasks} />   // lit task.title, task.done → mort dès que le champ change
```

À retenir — génériques TypeScript + accesseurs :

```tsx
<DataList
  items={anything}
  getKey={(x) => x.id}
  renderItem={(x) => <Row title={x.name} meta={x.owner} />}
  empty={<EmptyState … />}
/>
```

Chaque fiche concernée porte un bloc **Contrat de données** avec deux exemples de formes de données radicalement différentes. Ce double exemple est la preuve d'adaptabilité et montre où brancher ses propres données.

### 5.2 Contrat de props transversal

Les mêmes noms de props partout, sans exception : `variant`, `size`, `isLoading`, `className`, `as`, `onValueChange`. Jamais `kind` sur un composant et `variant` sur un autre.

Bénéfice : apprendre un composant permet de deviner les trente autres. Documenté en une page, vérifié à chaque revue.

## 6. Le catalogue

### 6.1 Mise en page

Trois colonnes, sur le modèle de `vite.dev/guide` :

```
┌──────────────────────────────────────────────────────────────────┐
│  react-foundry        [recherche ⌘K]              [☾]            │  barre haute
├───────────────┬──────────────────────────────┬───────────────────┤
│ Fondations    │  # Button                    │ Sur cette page    │
│ Primitives    │                              │  Aperçu           │
│  › Button   ◀ │  Description, quand l'uti-   │  Contrat de props │
│    Input      │  liser, aperçu live, code,   │  Banc d'essai     │
│    Dialog     │  contrat de données, pièges  │  Pièges           │
│ Notions       │                              │                   │
│ Données       │  [Précédent]     [Suivant]   │                   │
│ Recettes      │                              │                   │
└───────────────┴──────────────────────────────┴───────────────────┘
   sticky              max-width ~48rem            sticky
```

Grille : `grid-template-columns: 17rem minmax(0, 1fr) 14rem`, conteneur `max-width: 90rem` centré. Colonnes latérales `position: sticky` avec défilement propre.

- **Gauche** — navigation groupée par famille, sections repliables, entrée active surlignée
- **Centre** — le contenu de la fiche, largeur de lecture confortable (~48rem)
- **Droite** — ancres `h2`/`h3` de la fiche, ancre active mise à jour au défilement via `IntersectionObserver`

En bas de la colonne centrale : liens **Précédent / Suivant** dérivés de l'ordre du registry.

### 6.2 Responsive

| Largeur | Comportement |
|---|---|
| ≥ 1280px | trois colonnes |
| 960–1280px | colonne d'ancres masquée |
| < 960px | sidebar en tiroir déclenché par un bouton, contenu pleine largeur |

### 6.3 Navigation à deux axes

Le même corpus est navigable de deux façons, avec liens croisés :

- **Par composant** — « j'ai besoin d'un bouton » → fiche Button → copier
- **Par notion** — « quel est le bon usage de `useEffect` ? » → fiche notion → les composants du kit qui l'illustrent

La fiche `Button` déclare « utilise : polymorphisme `as`, `cn` » avec un lien vers chaque notion. La fiche `useEffect` liste les composants qui s'en servent, et ceux qui s'en passent volontairement.

### 6.4 Index par intention

Page d'accueil du catalogue : une liste de phrases en **« Je veux… »**, parce qu'on ne cherche pas « Dialog » mais « demander confirmation avant de supprimer ».

> Je veux… afficher une liste qui peut être vide · sauvegarder un formulaire · prévenir que ça a marché · empêcher un double-clic · filtrer sans perdre l'URL · gérer une erreur serveur

Chaque phrase pointe vers une fiche ou une recette. La navigation alphabétique reste disponible, en second.

### 6.5 Registry

Source de vérité unique. Ajouter une entrée au catalogue coûte **un fichier + une ligne**.

```ts
type Level = 'base' | 'intermediaire' | 'avance';
type Family = 'fondations' | 'primitives' | 'notions' | 'donnees' | 'formulaires' | 'recettes';

interface Entry {
  slug: string;
  title: string;
  family: Family;
  level: Level;
  summary: string;              // une phrase, affichée dans la nav et la recherche
  intents: string[];            // pour l'index par intention
  source: string;               // code réel importé via `?raw`
  deps: string[];               // dépendances à copier avec (ex. ['lib/cn.ts'])
  uses: string[];               // slugs des notions employées → liens croisés
  Doc: ComponentType;           // le contenu de la fiche
}
```

### 6.6 Gabarit de fiche

Toute fiche, composant comme notion, porte les mêmes blocs dans le même ordre :

1. **Le concept en trois lignes** — ce que ça résout, sans jargon
2. **Aperçu** — rendu live des variantes, vrai Tailwind, vrai dark mode
3. **Code** — le fichier réel, coloré, avec les boutons de copie
4. **Contrat de props / de données** — props typées, et pour les composants génériques deux exemples de formes de données distinctes
5. **Quand l'utiliser / quand surtout pas** — bloc décisif : une bonne part des bugs React viennent d'un `useEffect` qui n'aurait pas dû exister
6. **Axes d'adaptation** — les deux ou trois endroits précis à modifier pour plier le pattern à son besoin
7. **Banc d'essai** — onglet chargé à la demande
8. **Pièges** — erreurs classiques, avec le symptôme observable
9. **Prérequis** — mention honnête des dépendances (« Tailwind 4 · React 19 · rien d'autre »)
10. **Accessibilité** — une ligne factuelle (« clavier : ↑↓ pour naviguer, Échap pour fermer »)

Les fiches notions sont **courtes et opinionées** : une position claire par sujet, pas un cours exhaustif. La valeur ajoutée est « voilà comment on fait ici, et pourquoi ».

### 6.7 Copie

Le code affiché est importé via `import source from '../../components/ui/button.tsx?raw'` — il ne peut donc jamais diverger du fichier réel.

Deux boutons distincts :

- **Copier le composant** — le fichier seul
- **Copier avec les dépendances** — le fichier plus `lib/cn.ts` et les types nécessaires, concaténés dans un ordre compilable

### 6.8 Recherche

Modale au raccourci `⌘K` / `Ctrl+K`. Index construit depuis le registry, portant sur : titre, résumé, intentions, noms de props, **et messages d'erreur** (voir §9.7). Coller une erreur React dans la recherche doit mener à sa fiche.

## 7. Le banc d'essai

Panneau à trois zones plus une console, présent sur les fiches pertinentes :

```
┌─────────────────────────┬──────────────────────┐
│ Code  (JSX éditable)    │                      │
│                         │        Rendu         │
├─────────────────────────┤       (live)         │
│ Données (JSON éditable) │                      │
├─────────────────────────┴──────────────────────┤
│ ▸ Console            [Exécuter ⌘↵] [Réinit.]   │
└────────────────────────────────────────────────┘
```

- **Code** — le JSX de l'exemple, éditable
- **Données** — le JSON qui alimente le composant, éditable : c'est là qu'on vérifie que son propre contrat de données passe
- **Rendu** — mis à jour à l'exécution
- **Console** — `console.log` du sandbox capturés, plus erreurs de compilation et d'exécution avec le message exact

**Implémentation** : [Sucrase](https://github.com/alangpierce/sucrase) (~200 Ko) transpile JSX+TS dans le navigateur, puis `new Function` exécute avec un scope explicite (React et ses hooks, le composant de la fiche, `cn`). Écarté : `@babel/standalone` (~2,5 Mo, inutilement complet).

**Deux garde-fous obligatoires** :

- **Chargement paresseux, client-only** — le banc ne se charge qu'au clic sur son onglet, jamais en SSR. Le reste du catalogue reste léger.
- **Error boundary dédiée** — une faute de syntaxe affiche l'erreur dans la console, jamais un écran blanc. Elle doit se réinitialiser à chaque exécution, sinon l'utilisateur reste coincé après la première erreur.

**Hors v1** : coloration syntaxique dans l'éditeur. Un `<textarea>` monospace suffit ; CodeMirror ajoute ~500 Ko et de la complexité clavier. L'affichage en lecture seule de l'onglet Code, lui, est coloré — c'est là que la lisibilité compte.

## 8. Couche données

`app/lib/api/` typée, avec un **adaptateur mock** par défaut : données en mémoire, latence simulée, erreurs déclenchables à la demande. Le catalogue et l'app fonctionnent immédiatement, sans backend.

Passer au vrai backend ne doit toucher qu'un seul fichier (`client.ts`), jamais un composant.

Patterns de données couverts : liste alimentée par un loader, les quatre états (chargement / vide / erreur / succès), skeleton, pagination et filtres pilotés par l'URL, `ErrorBoundary` de route.

Formulaires et mutations : `Form` + `action` React Router, validation typée, erreurs serveur remontées champ par champ, état pending, optimistic UI, confirmation de suppression.

## 9. Contenu

### 9.1 Fondations
Tokens Tailwind 4 via `@theme` (couleurs, espacements, rayons, typo), thème clair/sombre, focus visible, contrastes, conventions de nommage et de découpage.

### 9.2 Primitives UI
Button (variantes, tailles, loading, icône), Input, Select, Textarea, Checkbox, Badge, Card, Avatar, Dialog, Toast. Purs, un fichier autonome chacun.

### 9.3 Notions — niveau Bases
JSX et props · état local · événements · rendu conditionnel · listes et clés (le vrai piège des clés) · formulaires contrôlés vs non contrôlés · remonter l'état.

### 9.4 Notions — niveau Intermédiaire
`useEffect` et ses quatre non-usages (données → loader, dérivation → calcul direct, événement → handler, synchronisation d'état → état dérivé) · `useMemo` / `useCallback` (mesurer avant) · `useRef` · hooks custom et méthode d'extraction (`useDebounce`, `useDisclosure`, `useLocalStorage`, `useMediaQuery`) · Context et son seuil concret face aux props · composition par `children` · Error Boundaries · Portals.

### 9.5 Notions — niveau Avancé
`useReducer` + Context · compound components · polymorphisme `as` · ref-as-prop (React 19, plus de `forwardRef`) · Suspense et streaming · `useTransition` / `useDeferredValue` / `useOptimistic` · `useActionState` / `useFormStatus` · `use()` · virtualisation de longues listes.

Atout structurel : le corpus est **React 19 + React Router v8 natif**, donc sans pattern legacy. Pas de `forwardRef`, pas de `useEffect` pour aller chercher des données.

### 9.6 Recettes
Des écrans complets assemblés depuis la banque — le manque n°1 des docs existantes. Savoir faire un `Button` ne dit pas comment monter un écran.

Première recette : « liste + filtres URL + création + suppression avec confirmation » — fichier de route complet, loader, action, et un commentaire par bloc expliquant *pourquoi* il est là. On copie l'écran entier, on remplace le domaine, ça marche le jour 1.

### 9.7 Erreurs courantes
Le message d'erreur exact → la cause → le correctif. Recherchable en collant l'erreur.

`Each child in a list should have a unique "key" prop` · `Too many re-renders` · `Cannot update a component while rendering a different component` · `Hydration failed` · `Objects are not valid as a React child`.

## 10. Accessibilité

Garantie, pas sujet d'étude. Les composants arrivent accessibles : focus visible, rôles corrects, navigation clavier, `aria-*` là où il faut, piège de focus dans les dialogues. La fiche l'annonce en une ligne factuelle, sans faire de cours.

## 11. Gestion des erreurs

| Endroit | Traitement |
|---|---|
| Chargement de données | `ErrorBoundary` de route, message actionnable, bouton Réessayer |
| Mutation échouée | erreurs serveur remontées champ par champ, état préservé |
| Banc d'essai | error boundary dédiée, message exact en console, réinitialisation à l'exécution suivante |
| Entrée de registry invalide | échec au typecheck, pas au runtime |

## 12. Tests

Vitest + Testing Library, en dernière phase. Un test exemplaire par famille, servant autant de démonstration que de filet :

- une primitive (variantes, état disabled, accessibilité clavier)
- un composant générique (deux formes de données distinctes)
- un formulaire avec action (succès et erreur serveur)

Plus le **test de fumée de la banque** : chaque composant compile isolément (§14).

## 13. Phasage

| Phase | Contenu |
|---|---|
| 0 | Renommage en `react-foundry`, tokens Tailwind, `cn.ts`, harnais de test de fumée (un composant témoin copié dans un fichier vierge doit compiler) |
| 1 | Moteur du catalogue : layout trois colonnes, registry, `?raw`, coloration, boutons de copie, ancres, recherche |
| 2 | Primitives UI |
| 3 | Banc d'essai (Sucrase, panneaux, console, garde-fous) |
| 4 | Fiches notions — Bases |
| 5 | Couche API mock + patterns données |
| 6 | Formulaires et mutations |
| 7 | Fiches notions — Intermédiaire et Avancé |
| 8 | Recettes + écran taskmanager réel consommant la banque |
| 9 | Erreurs courantes (alimenté en continu) + `CONVENTIONS.md` |
| 10 | Vitest + Testing Library |

Le catalogue est utile dès la dixième fiche, pas à la soixantième. Les phases 1 à 3 construisent l'usine ; le reste la remplit.

## 14. Critères d'acceptation

1. **Copiabilité** — chaque composant de `components/ui/` compile seul dans un fichier vierge d'un projet React 19 + Tailwind 4, sans dépendance autre que celles listées dans `deps`. Vérifié automatiquement.
2. **Pureté** — aucun fichier de `components/` n'importe `react-router` ni n'appelle `fetch`. Vérifiable par grep, à intégrer au CI.
3. **Cohérence** — les noms de props du §5.2 sont respectés partout.
4. **Fraîcheur du code** — le code affiché provient de `?raw`, jamais d'une chaîne dupliquée.
5. **Coût d'ajout** — ajouter une entrée au catalogue = un fichier + une ligne de registry.
6. **Poids** — la page d'une fiche ne charge pas Sucrase avant clic sur le banc d'essai.
7. **Trouvabilité** — toute entrée est atteignable en moins de 30 secondes depuis l'accueil, par intention ou par recherche.

## 15. Arbitrages et risques

**Arbitrages assumés** :
- Loaders/actions React Router natifs plutôt que TanStack Query : un seul modèle mental, SSR gratuit, zéro dépendance. La règle d'or garde les composants compatibles d'un éventuel changement.
- Catalogue maison plutôt que Storybook : ~300 Mo de dépendances et un runtime séparé évités, et le rendu utilise exactement le Tailwind de production.
- Fiches notions opinionées plutôt qu'exhaustives : react.dev couvre déjà le référentiel complet.

**Risques identifiés** :
- *Dérive de périmètre* — le contenu est potentiellement infini. Atténuation : l'usine avant le contenu, et un registry qui rend chaque ajout marginal.
- *Promesse de copiabilité rompue* — un composant qui ne compile pas isolément détruit la confiance. Atténuation : le test de fumée de la phase 0, bloquant.
- *Banc d'essai fragile* — l'évaluation de code arbitraire casse de façons imprévues. Atténuation : error boundary réinitialisable, et le banc reste un plus, jamais un prérequis à la lecture d'une fiche.
