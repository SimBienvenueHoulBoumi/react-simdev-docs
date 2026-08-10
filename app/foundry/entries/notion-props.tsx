// Pourquoi : fiche notion — props : le contrat d'entrée d'un composant (spec §5.2).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Les props = le contrat écrit du composant.
// Ici, noms de props stables et documentés une fois.
interface BadgeProps {
  variant?: "default" | "secondary" | "outline"; // le même nom partout
  size?: "sm" | "md" | "lg";                     // partout aussi
  className?: string;                            // TOUJOURS acceptée
  children?: ReactNode;
}

// Pourquoi cette discipline (spec §5.2) :
// apprendre un composant permet de deviner les trente autres.
// Jamais \`kind\` sur un composant et \`variant\` sur un autre.`;

export const PropsNotion: Entry = {
  slug: "notion-props",
  title: "JSX et props",
  family: "notions",
  level: "base",
  summary: "Le contrat d'entrée d'un composant : noms stables, types explicites, className partout.",
  intents: [
    "comprendre le rôle des props",
    "savoir quels noms de props sont la convention de la banque",
  ],
  source: EXAMPLE,
  deps: [],
  uses: [],
  props: ["variant", "size", "isLoading", "className", "as", "onValueChange"],
  Doc: PropsDoc,
};

function PropsDoc() {
  return (
    <>
      <Concept>
        <p>
          Les props sont le contrat que vous signez avec vos composants. La banque
          impose des noms transversaux — <code className="font-mono text-[13px]">variant</code>,{" "}
          <code className="font-mono text-[13px]">size</code>, <code className="font-mono text-[13px]">isLoading</code>{" "}
          (jamais <em>loading</em> ni <em>busy</em>), <code className="font-mono text-[13px]">className</code>{" "}
          toujours acceptée et fusionnée. Vos composants qui deviennent publics
          devraient en faire autant.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — jsx-et-props" />

      <WhenToUse
        yes={
          <>
            <li>Nommer les props par leur ROLE : variant, size, href, items…</li>
            <li>Typer les props : aucun composant de la banque n'utilise `any`</li>
          </>
        }
        no={
          <>
            <li>Le même concept sous deux noms en fonction du composant</li>
            <li>Des props mutables après montage si le contrat dit « init »</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Props « fantômes » : le composant ne fait rien de ce qu'on lui passe", cause: "Props non typées ou spread aveugle — typez et consommez explicitement." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Bases" },
          { label: "À retenir", value: "variant · size · isLoading · className · as — partout, sans exception" },
        ]}
      />
    </>
  );
}