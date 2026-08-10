# Hooks — pédagogie et banc d'essai — Design

**Date** : 2026-08-11
**Statut** : validé, prêt pour implémentation
**Complète** : `2026-08-10-react-foundry-design.md` (§6.6 gabarit, §7 banc d'essai, §9.4 notions)

---

## 1. Problème

La notion des hooks n'est pas appréhendable en l'état. Quatre défauts distincts, confirmés :

1. **La fiche `notion-hooks`** est un inventaire de signatures. Elle dit ce que chaque hook *rend*, jamais ce qu'un hook *est*, ni pourquoi l'ordre d'appel est sacré.
2. **Le panneau « État des hooks »** affiche `useState[0] compteur` : un nom que le lecteur n'a jamais écrit, une valeur sans cause.
3. **Le parcours** entre les dix fiches satellites (`notion-state`, `notion-effects`, `notion-reducer`, `notion-ref`, `notion-memo`, `notion-context`, `notion-transition`, `notion-action-state`, `notion-use-fn`, `notion-custom-hooks`) n'existe pas : aucun ordre d'entrée.
4. **La démo** (`Controls` : input + reducer + memo) mélange trois mécanismes et n'en isole aucun.

S'y ajoutent deux défauts de l'UI du banc, indépendants du sujet hooks mais bloquants pour la démonstration :

5. **Le banc n'est ni intuitif ni professionnel** — à l'ouverture la zone Rendu est vide sans invite ; rien ne signale que le code a été modifié sans être ré-exécuté ; « Exécuter » et « Réinit. » ont le même poids visuel ; hauteurs figées (`h-44` / `h-36` / `h-24`).
6. **La surface du rendu est trop petite** — `min-h-40` dans une demi-colonne. Un composant réel du projet (liste de tâches, dialog, formulaire) n'y tient pas, ce qui contredit la promesse §7 « collez VOS données et vérifiez que votre contrat passe ».

**Principe directeur** : chaque expérience du banc isole *un* mécanisme, et le panneau de hooks en est la réponse lisible.

## 2. Non-objectifs

- Réorganiser le gabarit §6.6. L'ordre des blocs est ce qui rend les 40 fiches prévisibles, et le sommaire en dépend.
- Ajouter un champ au type `Entry`. Le parcours est porté par la fiche hub, pas par le registry.
- Modifier les dix fiches satellites. Elles héritent du nouveau banc sans changement.
- Introduire un parser AST. Voir §5.2.
- Coloration syntaxique dans l'éditeur — reste hors périmètre (spec §7). Seule la **gouttière de numéros de ligne** est ajoutée.

## 3. La fiche `notion-hooks`

Ordre du gabarit §6.6 **inchangé**. Un bloc est ajouté, aucun n'est déplacé.

| # | Bloc | Changement |
|---|---|---|
| 1 | Le concept en trois lignes | **Réécrit** — « un hook, c'est la mémoire d'un composant entre deux rendus », plus les deux règles : toujours au premier niveau, jamais dans une condition |
| 2 | **Par où commencer** | **Nouveau** — parcours ordonné et commenté vers les fiches satellites |
| 3 | Code | Le répertoire actuel, dégraissé : le parcours porte désormais la progression |
| 4 | Banc d'essai | **4 expériences commutables** |
| 5 | Quand l'utiliser / quand surtout pas | conservé |
| 6 | Pièges | **Réécrit** — les deux pièges actuels décrivent le panneau, pas les hooks |
| 7 | Prérequis & accessibilité | ajusté |

### 3.1 Bloc « Par où commencer »

Liste ordonnée, chaque entrée liant vers la fiche satellite avec une raison d'y aller :

1. **État local** (`notion-state`) — `useState`, la valeur qui déclenche le rendu
2. **Effets** (`notion-effects`) — `useEffect`, et pourquoi on en écrit trop
3. **Références** (`notion-ref`) — `useRef`, se souvenir sans re-rendre
4. **Reducer** (`notion-reducer`) — `useReducer`, quand `useState` ne suffit plus
5. **Mémoïsation** (`notion-memo`) — `useMemo` / `useCallback`

Puis, en second rang : `notion-context`, `notion-transition`, `notion-action-state`, `notion-use-fn`, `notion-custom-hooks`.

Rendu comme une `<ol>` de liens React Router. Pas d'ancre `data-toc` : le bloc a déjà son `h2`.

### 3.2 Les quatre expériences

Chacune tient en une dizaine de lignes, précédée de sa thèse en clair.

| Onglet | Thèse | Mécanisme isolé |
|---|---|---|
| **Le rendu** | « Sans `useState`, React ne rend rien. » | `let n = 0` et `useState` incrémentés ensemble ; un seul s'affiche |
| **La mémoire** | « Un `ref` se souvient, mais ne réveille personne. » | `useRef` contre `useState` : le ref retient, l'écran ne bouge pas |
| **Le cache** | « `useMemo` ne recalcule que si ses dépendances changent. » | Un memo et deux states : l'un recalcule, l'autre non |
| **La règle** | « Un hook dans un `if`, et React perd le fil. » | `useState` conditionnel → l'erreur React réelle tombe dans la console |

L'expérience « La règle » exerce volontairement l'error boundary existante : l'échec est le contenu pédagogique.

**Contrainte de rédaction** : une expérience = **un seul composant appelant des hooks**. C'est la condition du nommage (§5.2). À inscrire dans `CONVENTIONS.md`.

## 4. Le banc d'essai — mise en page B

Grammaire CodePen : on écrit en haut, on voit en bas.

```
┌──────────────────────────────────────────────────────────┐
│ [Le rendu][La mémoire][Le cache][La règle]   ● état  ▶ ⌘↵ ⤢ │  barre d'outils
├───────────────────────────┬──────────────────────────────┤
│ Code (gouttière + JSX)    │ Données (JSON)               │
├───────────────────────────┴──────────────────────────────┤
│ ▬▬▬ poignée de redimensionnement ▬▬▬                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                  RENDU — pleine largeur                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [Hooks 2][Console 1]                                     │
│ Rendu #1 montage · Rendu #2 ← setTri("titre") · …        │  chronologie dépliée
└──────────────────────────────────────────────────────────┘
```

### 4.1 Ce qui change

- **Barre d'outils unique** en tête : onglets d'expériences à gauche, indicateur d'état et actions à droite.
- **Action primaire distincte** — « Exécuter ⌘↵ » en bouton plein ; « Réinit. » reste secondaire.
- **Indicateur d'état d'exécution**, trois valeurs :
  - `à jour` (vert) — le rendu correspond au code affiché
  - `modifié` (ambre) — le code ou les données ont changé depuis la dernière exécution
  - `erreur` (rouge) — la dernière exécution a échoué
  Calculé en comparant `codeValue`/`dataValue` aux valeurs capturées au moment du `run()`.
- **Invite de premier lancement** — tant qu'aucune exécution n'a eu lieu, la scène affiche « Appuyez sur Exécuter (⌘↵) pour lancer », jamais un vide muet.
- **Gouttière de numéros de ligne** sur l'éditeur de code, synchronisée au défilement du `<textarea>`. Pas de coloration.
- **Validation JSON en direct** sur la zone Données : `✓ n éléments` ou le message d'erreur de parse, sans attendre l'exécution.
- **Scène pleine largeur**, hauteur par défaut `min-h-[18rem]`, fond distinct du châssis, **redimensionnable** par la poignée (persistée en `localStorage["foundry-bench-stage"]`).
- **Bouton ⤢** — la scène passe en plein écran via l'API `requestFullscreen` sur le conteneur du banc, avec repli sur une classe `fixed inset-0 z-50` si l'API est refusée.
- **Inspecteur à onglets en pied** — `Hooks` et `Console`, chacun avec son compteur ; la console porte en plus le nombre d'erreurs en rouge. Remplace l'empilement actuel des deux zones.

### 4.2 Ce qui ne change pas

Le contrat d'exécution (`hasTopLevelReturnIn`, expression contre programme, injection de `data`, `ToastProvider`) est intact — il est verrouillé par `tests/bench-contract.test.ts`.

## 5. Le panneau de hooks

### 5.1 Modèle de données

Le `Tracker` passe d'une `Map<nom, valeurs[]>` à une liste de passes de rendu :

```ts
export interface HookSample {
  name: string;      // "count" si nommé, sinon "useState[0]"
  kind: string;      // "useState"
  value: string;
  changed: boolean;  // différent de la même position à la passe précédente
}

export interface RenderPass {
  index: number;             // 1, 2, 3…
  trigger: string | null;    // "setCount" — null au montage
  samples: HookSample[];
}
```

- `tracedSetter` transmet son nom : `tracker.beginRender(nomDuSetter)`.
- `changed` se calcule au commit, par comparaison avec la passe précédente à la même position.
- **La fusion de la re-passe StrictMode est conservée telle quelle** — comportement déjà verrouillé par `tests/hook-tracker.test.tsx`.
- `subscribe` / `getSnapshot` gardent leur contrat `useSyncExternalStore`.

### 5.2 Nommage des hooks

Nouveau module `app/components/layout/bench-hook-names.ts`, fonction pure testable sans DOM :

```ts
export function extractHookNames(code: string): Map<string, string[]>
```

Clé : le `kind` (`"useState"`). Valeur : les noms de variables dans l'ordre d'apparition textuelle.

Formes reconnues :

| Source | Nom retenu | Setter |
|---|---|---|
| `const [count, setCount] = useState(…)` | `count` | `setCount` |
| `const [state, dispatch] = useReducer(…)` | `state` | `dispatch` |
| `const square = useMemo(…)` | `square` | — |
| `const ref = useRef(…)` | `ref` | — |
| `const ctx = useContext(…)` | `ctx` | — |
| `const [pending, start] = useTransition()` | `pending` | `start` |

**Garde-fou contre le faux nom.** L'appariement textuel n'est fiable que si le code ne contient **qu'une seule fonction appelant des hooks** : dès qu'il y en a deux (parent et enfant, cas de `notion-lifting`), l'ordre d'appel de React ne suit plus l'ordre du fichier. Règle : si le code déclare plus d'une fonction dont le corps appelle un `use…`, `extractHookNames` renvoie une map **vide** et le panneau retombe intégralement sur `useState[0]`, comme aujourd'hui.

Un nom faux est pire que pas de nom : dans un outil dont le but est d'expliquer, il enseignerait l'inverse de la leçon.

**Arbitrage : pas de parser AST.** La spec §7 a écarté `@babel/standalone` (2,5 Mo) au profit de Sucrase (200 Ko). Ajouter `acorn` (~120 Ko) pour du confort d'affichage contredirait cet arbitrage. Regex ordonnée plus repli conservateur.

### 5.3 Affichage

Chronologie dépliée horizontalement (la mise en page B donne la largeur complète au pied) :

```
Rendu #1 · montage        Rendu #2 · ← setTri("titre")     Rendu #3 · ← setC(2)
tri  useState  "prio"     tri  useState "prio" → "titre" ⚡  tri  useState "titre"
                          vues useMemo  recalculé            vues useMemo  cache réutilisé
```

- `⚡` marque un `changed`.
- « inchangé » / « cache réutilisé » pour les valeurs stables — c'est la moitié de la leçon sur `useMemo`.
- État vide conservé : « aucun hook use*** exécuté ».

## 6. Le sommaire

Le sommaire est un **instantané pris au montage** (`$slug.tsx`, un `querySelectorAll` unique), alors que le banc est **replié par défaut et chargé paresseusement**. Bug latent sur les 40 fiches : tout titre apparaissant après le montage n'entre jamais dans le sommaire.

**6.1 Sommaire vivant.** Le scan unique devient un `MutationObserver` sur `<main>`, déclenché en `requestAnimationFrame`. Garde-fou obligatoire : comparer les items (id + label + level) avant d'appeler `setToc`, sinon `setToc` → re-rendu → mutation → boucle infinie.

**6.2 Scan élargi.** La requête passe de `main h2[id], main h3[id]` à `main h2[id], main h3[id], main [data-toc][id]`. N'importe quelle fiche peut déclarer une ancre sans inventer un titre. Le `label` vient de l'attribut `data-toc` quand il est présent, sinon du `textContent`. Le `level` d'un `[data-toc]` est 3.

**6.3 Le hash pilote le banc.** `#banc-le-cache` déplie le banc et sélectionne l'expérience, au montage et à chaque `hashchange`. Chaque expérience devient adressable par URL.

**Arbitrage : le sommaire reste un miroir du DOM**, il ne devient pas un registre déclaratif. Les quatre sous-ancres n'apparaissent donc qu'une fois le banc déplié — cohérent avec le fait qu'il a toujours reflété ce qui est à l'écran, et cela évite d'introduire une API de contribution au sommaire pour un seul cas d'usage.

## 7. Périmètre

**Modifié** — `app/components/layout/bench.tsx`, `app/components/layout/bench-panel.tsx`, `app/foundry/sheet.tsx`, `app/foundry/entries/notion-hooks.tsx`, `app/routes/foundry/$slug.tsx`, `app/components/layout/table-of-contents.tsx` (si besoin pour le niveau 3), `docs/superpowers/conventions.md`, `.gitignore`.

**Créé** — `app/components/layout/bench-hook-names.ts`, `tests/bench-hook-names.test.ts`.

**Non touché** — les dix fiches satellites, le type `Entry`, le gabarit §6.6, la navigation. Les autres fiches à banc héritent de la nouvelle mise en page et du nouveau panneau ; celles à plusieurs composants retombent proprement sur l'affichage par indices.

## 8. Tests

`npm test` (Vitest + Testing Library, jsdom).

**`tests/bench-hook-names.test.ts`** (nouveau)
- Chaque forme canonique du tableau §5.2 donne le bon nom
- Deux fonctions à hooks → map vide (repli)
- Code sans hook → map vide
- Un `useState` en commentaire ne compte pas

**`tests/hook-tracker.test.tsx`** (adapté — la forme du `snapshot()` change)
- Les passes sont numérotées à partir de 1
- Le déclencheur est enregistré ; `null` au montage
- `changed` est **faux à la passe 1** (au montage rien n'a changé : tout naît) ; à partir de la passe 2, vrai si la valeur diffère de la même position à la passe précédente, ou si cette position n'existait pas
- **La fusion de la re-passe StrictMode reste verte** (test existant conservé)
- `reset()` vide et notifie ; `getSnapshot` change à chaque échantillon
- `HookMonitor` rend les passes, affiche « inchangé », et retombe sur les index sans noms

**`tests/bench-contract.test.ts`** — inchangé, doit rester vert.

**Nouveaux tests de banc**
- L'indicateur passe à « modifié » quand le code est édité après exécution
- L'invite de premier lancement s'affiche tant que rien n'a été exécuté
- Le changement d'onglet d'expérience recharge le code correspondant

**Sommaire**
- Un titre ajouté après le montage entre dans le sommaire (`MutationObserver`)
- Un `[data-toc][id]` est indexé au niveau 3
- Pas de boucle : deux scans identiques n'appellent `setToc` qu'une fois

## 9. Correctif annexe — décalage du bascule Tailwind / MUI

Signalé pendant l'implémentation, corrigé dans la foulée car il touche le même fichier (`app/foundry/sheet.tsx`).

Le bloc `Code` mémorise un onglet « forcé » (`forced`) qui prime sur le moteur global, et le remettait à `null` dans un `useEffect` dépendant de `engine`. Conséquence : au basculement global, le **premier rendu affichait encore l'ancienne variante** et seul le rendu suivant corrigeait — un décalage d'une frame parfaitement visible.

Correctif : l'ajustement se fait **pendant le rendu**, patron React officiel « ajuster l'état quand une prop change ».

```tsx
const [lastEngine, setLastEngine] = useState(engine);
if (engine !== lastEngine) {
  setLastEngine(engine);
  setForced(null);
}
```

React relance alors le rendu immédiatement, avant le commit : aucune frame intermédiaire n'est peinte. Le `useEffect` est supprimé.

## 10. Critère de réussite

Un lecteur ouvre `notion-hooks`, déplie le banc, clique « Le rendu », exécute — et voit dans le pied que `c` est passé de 0 à 1 sous l'effet de `setC`, tandis que `n` n'apparaît nulle part. Il comprend en une lecture pourquoi `n` ne s'affiche pas.
