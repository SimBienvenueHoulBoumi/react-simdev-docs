// Pourquoi : le panneau de hooks affichait « useState[0] » — un nom que le
// lecteur n'a jamais écrit. Ce module retrouve le VRAI nom de variable dans le
// code du banc (`count`, `square`…) pour que le tracé parle sa langue.
//
// Arbitrage (design §5.2) : appariement par regex, pas de parser AST. La spec
// §7 a écarté @babel/standalone (2,5 Mo) au profit de Sucrase (200 Ko) ;
// ajouter acorn (~120 Ko) pour du confort d'affichage contredirait ce choix.
//
// Garde-fou : l'appariement textuel n'est fiable que si UN SEUL composant
// appelle des hooks. Dès qu'il y en a deux (parent + enfant), l'ordre d'appel
// de React ne suit plus l'ordre du fichier — on renvoie alors un nommage vide
// et le panneau retombe sur les index. Un nom faux est pire que pas de nom :
// dans un outil qui explique, il enseignerait l'inverse de la leçon.

/** Noms relevés pour un `kind` de hook, dans l'ordre d'apparition textuelle.
 *  `undefined` à une position = appel sans affectation (ex. `useEffect(…)`). */
export interface HookNaming {
  /** kind → noms de la valeur retournée (`count` pour `const [count] = useState`) */
  values: Map<string, (string | undefined)[]>;
  /** kind → noms du setter / dispatch (`setCount`) */
  setters: Map<string, (string | undefined)[]>;
}

export const EMPTY_NAMING: HookNaming = { values: new Map(), setters: new Map() };

/** Un appel de hook : `useState(`, `React.useState(`, `ReactScope.useState(`,
 *  précédé le cas échéant de son affectation déstructurée ou simple. */
const HOOK_CALL =
  /(?:(?:const|let|var)\s+(?:\[\s*([\w$]+)\s*(?:,\s*([\w$]+)\s*)?\]|([\w$]+))\s*=\s*)?(?:[\w$]+\s*\.\s*)?\b(use[A-Z][\w$]*)\s*\(/g;

/** Frontières de fonction qui comptent : déclarations `function X(` et
 *  composants / hooks custom affectés (`const Demo = () =>`, `const useX = …`).
 *  Les handlers en minuscule (`onClick`, `handleSubmit`) n'en sont pas : ils
 *  vivent DANS un composant et ne doivent pas le scinder. */
const FN_BOUNDARY =
  /\bfunction\s+[\w$]+|(?:const|let|var)\s+(?:[A-Z][\w$]*|use[A-Z][\w$]*)\s*=\s*(?:function\b|\([^)]*\)\s*=>|[\w$]+\s*=>)/g;

const ANY_HOOK_CALL = /(?:[\w$]+\s*\.\s*)?\buse[A-Z][\w$]*\s*\(/;

/** Retire commentaires de ligne et de bloc — un `// useState(0)` en commentaire
 *  ne doit pas consommer un index. */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
}

/** Combien de fonctions distinctes appellent des hooks ? Au-delà d'une seule,
 *  l'ordre textuel ne prédit plus l'ordre d'appel de React. */
function countHookFunctions(code: string): number {
  const cuts: number[] = [];
  for (const m of code.matchAll(FN_BOUNDARY)) cuts.push(m.index ?? 0);
  if (cuts.length === 0) return ANY_HOOK_CALL.test(code) ? 1 : 0;

  let count = 0;
  for (let i = 0; i < cuts.length; i++) {
    const segment = code.slice(cuts[i], cuts[i + 1] ?? code.length);
    if (ANY_HOOK_CALL.test(segment)) count++;
  }
  return count;
}

/**
 * Relève les noms de variables des hooks du code du banc.
 * Renvoie un nommage vide si l'appariement ne peut pas être garanti.
 */
export function extractHookNames(code: string): HookNaming {
  const clean = stripComments(code);

  if (countHookFunctions(clean) > 1) return EMPTY_NAMING;

  const values = new Map<string, (string | undefined)[]>();
  const setters = new Map<string, (string | undefined)[]>();

  for (const m of clean.matchAll(HOOK_CALL)) {
    const [, destructured, setter, simple, kind] = m;
    if (!kind) continue;
    if (!values.has(kind)) {
      values.set(kind, []);
      setters.set(kind, []);
    }
    values.get(kind)!.push(destructured ?? simple);
    setters.get(kind)!.push(setter);
  }

  return { values, setters };
}
