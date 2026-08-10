// Pourquoi : fiche notion — la PORTE D'ENTRÉE du sujet hooks (design §3).
// Elle ne liste plus des signatures : elle dit ce qu'un hook EST, donne l'ordre
// de lecture vers les fiches satellites, et fait voir quatre mécanismes isolés
// au banc d'essai. Le panneau « État des hooks » du banc est la réponse à
// chaque expérience : il nomme les hooks par leur vraie variable et montre la
// chronologie des rendus avec leur déclencheur.

import { Link } from "react-router";
import type { Entry } from "../registry";
import * as ReactScope from "react";
import type { BenchExperiment } from "~/components/layout/bench";
import {
  BenchSection,
  Code,
  Concept,
  Facts,
  Pitfalls,
  SheetSection,
  WhenToUse,
} from "../sheet";

const PATTERNS = `// Le répertoire des hooks use*** — ce que chacun REND :

// État et rendu :
const [value, setValue] = useState(initial);        // [valeur, setter]
const [state, dispatch] = useReducer(reduce, init); // [état, dispatch]
const ctx = useContext(Ctx);                        // la valeur du Context
const ref = useRef(initial);                        // { current } — stable, sans rendu

// Mémoïsation :
const v = useMemo(() => compute(a), [a]);           // valeur calculée
const fn = useCallback(cb, [a]);                    // fonction stable

// Cycle de vie — effets de bord :
useEffect(fn, deps);        // après le rendu (le plus courant)
useLayoutEffect(fn, deps);  // avant le paint (mesures DOM)

// Identité et concurrence :
const id = useId();                                 // identifiant stable
const [pending, start] = useTransition();           // [en attente, démarreur]
const deferred = useDeferredValue(value);           // valeur reportée

// Actions et formulaires :
const [state, action, pending] = useActionState(action, init);
const [optimistic, setOptimistic] = useOptimistic(value, merge);
const resource = use(promiseOrContext);             // promesse / Context`;

/* ——— Les quatre expériences : une thèse, un mécanisme (design §3.2) ———
   Règle de rédaction : UN SEUL composant à hooks par expérience. C'est la
   condition pour que le panneau puisse nommer les hooks (voir CONVENTIONS §10). */

const EXPERIMENTS: BenchExperiment[] = [
  {
    id: "le-rendu",
    label: "Le rendu",
    thesis:
      "Sans useState, React ne rend rien. Cliquez « n + 1 » plusieurs fois : rien ne bouge. Puis « c + 1 » — et n révèle d'un coup tout ce qu'il avait compté en silence.",
    code: `let n = 0;   // une variable ordinaire : React ne la surveille pas

function Demo() {
  const [c, setC] = ReactScope.useState(0);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => { n = n + 1; }}
        className="rounded-md border border-border px-3 py-1.5 text-sm"
      >
        n + 1
      </button>
      <button
        onClick={() => setC(c + 1)}
        className="rounded-md border border-border px-3 py-1.5 text-sm"
      >
        c + 1
      </button>
      <p className="text-sm">
        n = {n} · c = {c}
      </p>
    </div>
  );
}

return <Demo />;`,
  },
  {
    id: "la-memoire",
    label: "La mémoire",
    thesis:
      "Un ref se souvient, mais ne réveille personne. Incrémentez le ref : l'écran ne bouge pas. La valeur est pourtant bien là — le bouton « lire » va la chercher.",
    code: `function Demo() {
  const clics = ReactScope.useRef(0);
  const [lu, setLu] = ReactScope.useState(0);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => { clics.current = clics.current + 1; }}
        className="rounded-md border border-border px-3 py-1.5 text-sm"
      >
        ref + 1
      </button>
      <button
        onClick={() => setLu(clics.current)}
        className="rounded-md border border-border px-3 py-1.5 text-sm"
      >
        lire le ref
      </button>
      <p className="text-sm">
        affiché = {lu} — le ref, lui, vaut ce qu'il vaut
      </p>
    </div>
  );
}

return <Demo />;`,
  },
  {
    id: "le-cache",
    label: "Le cache",
    thesis:
      "useMemo ne recalcule que si ses dépendances changent. Changez le nom : le composant re-rend, mais le carré n'est pas recalculé — le panneau affiche « cache réutilisé » et la console reste muette.",
    code: `function Demo() {
  const [n, setN] = ReactScope.useState(2);
  const [nom, setNom] = ReactScope.useState("carré");

  const carre = ReactScope.useMemo(() => {
    console.log("calcul du carré de " + n);
    return n * n;
  }, [n]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setN(n + 1)}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          n + 1 → recalcule
        </button>
        <button
          onClick={() => setNom(nom === "carré" ? "puissance" : "carré")}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          changer le nom → ne recalcule pas
        </button>
      </div>
      <p className="text-sm">
        {nom} de {n} = {carre}
      </p>
    </div>
  );
}

return <Demo />;`,
  },
  {
    id: "la-regle",
    label: "La règle",
    thesis:
      "Un hook dans un if, et React perd le fil. Cliquez : le nombre de hooks change entre deux rendus, React lève l'erreur. C'est l'échec qui est ici le contenu — regardez l'onglet Console.",
    code: `function Demo() {
  const [ouvert, setOuvert] = ReactScope.useState(false);

  // ✗ INTERDIT : au premier rendu React voit 1 hook, au second il en voit 2.
  //   L'ordre d'appel est le SEUL moyen qu'il a de les reconnaître.
  if (ouvert) {
    const [secret] = ReactScope.useState("boum");
    console.log(secret);
  }

  return (
    <button
      onClick={() => setOuvert(true)}
      className="rounded-md border border-destructive/40 px-3 py-1.5 text-sm text-destructive"
    >
      Déclencher l'erreur
    </button>
  );
}

return <Demo />;`,
  },
];

/* ——— Le parcours vers les fiches satellites (design §3.1) ——— */

const PARCOURS: { slug: string; titre: string; pourquoi: string }[] = [
  { slug: "notion-state", titre: "État local", pourquoi: "useState — la valeur qui déclenche le rendu" },
  { slug: "notion-effects", titre: "Effets", pourquoi: "useEffect — et pourquoi vous en écrivez trop" },
  { slug: "notion-ref", titre: "Références", pourquoi: "useRef — se souvenir sans re-rendre" },
  { slug: "notion-reducer", titre: "Reducer", pourquoi: "useReducer — quand useState ne suffit plus" },
  { slug: "notion-memo", titre: "Mémoïsation", pourquoi: "useMemo / useCallback — le cache et ses dépendances" },
];

const AVANCE: { slug: string; titre: string }[] = [
  { slug: "notion-context", titre: "Context" },
  { slug: "notion-transition", titre: "Transitions" },
  { slug: "notion-action-state", titre: "État d'action" },
  { slug: "notion-use-fn", titre: "La fonction use()" },
  { slug: "notion-custom-hooks", titre: "Hooks custom" },
];

export const HooksNotion: Entry = {
  slug: "notion-hooks",
  title: "Les hooks use***",
  family: "notions",
  level: "avance",
  summary:
    "Un hook, c'est la mémoire d'un composant entre deux rendus. Quatre expériences le font voir, et le banc trace chaque rendu avec son déclencheur.",
  intents: [
    "comprendre ce qu'est un hook",
    "retrouver le hook dont on a besoin",
    "savoir dans quel ordre apprendre les hooks",
    "voir ce que chaque hook renvoie",
  ],
  source: PATTERNS,
  deps: [],
  uses: [
    "notion-state",
    "notion-effects",
    "notion-ref",
    "notion-reducer",
    "notion-memo",
    "notion-custom-hooks",
  ],
  props: ["useState", "useReducer", "useMemo", "useCallback", "useRef", "useTransition", "useActionState"],
  errors: [
    "Rendered more hooks than during the previous render",
    "React has detected a change in the order of Hooks",
    "Invalid hook call. Hooks can only be called inside of the body of a function component",
  ],
  Doc: HooksDoc,
};

function HooksDoc() {
  return (
    <>
      <Concept>
        <p>
          Un hook, c'est <strong>la mémoire d'un composant entre deux rendus</strong>. Une
          fonction React s'exécute en entier à chaque rendu : ses variables locales meurent
          à la fin. Le hook est le crochet auquel on suspend ce qui doit survivre — une
          valeur, une référence, un abonnement.
        </p>
        <p>
          React ne reconnaît pas vos hooks à leur nom : il les reconnaît{" "}
          <strong>à leur ordre d'appel</strong>. D'où les deux seules règles à retenir —
          toujours au premier niveau du composant, <strong>jamais</strong> dans une
          condition, une boucle ou une fonction imbriquée. La quatrième expérience du banc
          montre ce qui se passe quand on les enfreint.
        </p>
      </Concept>

      <SheetSection id="par-ou-commencer" title="Par où commencer">
        <p className="text-sm text-muted-foreground">
          Les hooks se lisent dans cet ordre. Chaque étape suppose la précédente.
        </p>
        <ol className="flex flex-col gap-2">
          {PARCOURS.map((etape, i) => (
            <li key={etape.slug} className="flex gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs">
                {i + 1}
              </span>
              <span>
                <Link
                  to={`/foundry/${etape.slug}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {etape.titre}
                </Link>
                <span className="text-muted-foreground"> — {etape.pourquoi}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-1 text-sm text-muted-foreground">
          Ensuite seulement, et seulement quand le besoin se présente :{" "}
          {AVANCE.map((a, i) => (
            <span key={a.slug}>
              {i > 0 && " · "}
              <Link
                to={`/foundry/${a.slug}`}
                className="underline-offset-4 hover:underline hover:text-foreground"
              >
                {a.titre}
              </Link>
            </span>
          ))}
          .
        </p>
      </SheetSection>

      <Code source={PATTERNS} filename="notion — repertoire-des-hooks" />

      <BenchSection
        code={EXPERIMENTS[0].code}
        data={""}
        scope={{ ReactScope }}
        experiments={EXPERIMENTS}
      />

      <WhenToUse
        yes={
          <>
            <li>Le hook par défaut : <code>useState</code> — une valeur + son setter</li>
            <li><code>useReducer</code> : des transitions nommées sur un état complexe</li>
            <li><code>useMemo</code> / <code>useCallback</code> : calcul coûteux ou stabilité de référence</li>
            <li><code>useRef</code> : une valeur stable sans re-rendu (DOM, compteurs)</li>
          </>
        }
        no={
          <>
            <li>Lancer <code>useMemo</code> pour du calcul trivial : le cache coûte plus que le calcul</li>
            <li>Remplacer trois <code>useState</code> par un <code>useReducer</code> « par élégance »</li>
            <li>Muter <code>ref.current</code> pour afficher quelque chose : c'est l'affaire de <code>useState</code></li>
            <li>Appeler un hook dans un <code>if</code>, une boucle, un <code>try</code> — sans exception</li>
          </>
        }
      />

      <Pitfalls
        items={[
          {
            symptom: "« Rendered more hooks than during the previous render »",
            cause: "Un hook dans une branche conditionnelle : le nombre d'appels change d'un rendu à l'autre et React perd la correspondance. Remontez-le au-dessus du if — c'est l'expérience « La règle » du banc.",
          },
          {
            symptom: "Une valeur change mais l'écran ne bouge pas",
            cause: "La valeur est dans une variable ordinaire ou dans un ref : ni l'une ni l'autre ne déclenche de rendu. Voir les expériences « Le rendu » et « La mémoire ».",
          },
          {
            symptom: "Un useMemo qui semble ne jamais se rafraîchir",
            cause: "Sa dépendance n'est pas dans le tableau, ou change d'identité à chaque rendu (objet ou fonction recréés). Le panneau affiche « cache réutilisé » à chaque passe où il n'a pas recalculé.",
          },
          {
            symptom: "Les hooks s'appellent useState[0] au lieu de leur vrai nom",
            cause: "Le code du banc contient plus d'un composant à hooks : l'ordre du fichier ne prédit plus l'ordre d'appel de React, le panneau refuse alors de nommer plutôt que de risquer un nom faux.",
          },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé" },
          { label: "Prérequis", value: "React 19 — rien d'autre" },
          { label: "Hooks tracés", value: "tous les use*** du code du banc : nom réel, valeur, et le rendu qui les a changés" },
          { label: "À retenir", value: "Un hook est reconnu à son ORDRE d'appel — d'où les deux règles" },
        ]}
      />
    </>
  );
}
