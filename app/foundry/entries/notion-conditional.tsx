// Pourquoi : fiche notion — rendu conditionnel : ternaires et ET logique (spec §9.3).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Trois outils, un seul usage raisonné.

// 1. Ternaire — deux branches, chacune explicite.
function StatusBanner({ status }) {
  return status === "error" ? (
    <p className="text-destructive">Échec du chargement</p>
  ) : (
    <p className="text-muted-foreground">{status}</p>
  );
}

// 2. ET logique — une seule branche, pas de sinon.
function Loader({ loading }) {
  return loading && <Spinner />;
}
// (loading est un boolean — jamais un nombre : 0 && x rend "0")

// 3. Retour anticipé — le cas tôt, le flux principal dégagé.
function Row({ item }) {
  if (!item) return null;
  return <article>{item.title}</article>;
}`;

export const ConditionalNotion: Entry = {
  slug: "notion-conditional",
  title: "Rendu conditionnel",
  family: "notions",
  level: "base",
  summary: "Ternaire pour deux branches, ET logique pour une seule, retour anticipé pour dégager le flux.",
  intents: [
    "afficher ou masquer un élément selon un état",
    "choisir entre ternaire et ET logique",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-state"],
  props: ["condition", "ternaire", "&&", "null"],
  Doc: ConditionalDoc,
};

function ConditionalDoc() {
  return (
    <>
      <Concept>
        <p>
          Trois outils, chacun pour un cas : le <strong>ternaire</strong> quand il y a deux
          branches visibles, le <strong>ET logique</strong> (<code className="font-mono text-[13px]">&amp;&amp;</code>)
          quand il n'y a qu'une branche et rien sinon, le <strong>retour anticipé</strong>{" "}
          (ou le rendu de <code className="font-mono text-[13px]">null</code>) pour les cas
          limites. Le JSX ne gère pas les structures de contrôle — c'est du JavaScript,
          donc les opérateurs JavaScript.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — rendu-conditionnel" />

      <WhenToUse
        yes={
          <>
            <li>Ternaire : exactement deux états visibles (chargement / erreur, vide / rempli)</li>
            <li><code>&amp;&amp;</code> : « afficher X si condition » — rien à afficher sinon</li>
            <li>Retour anticipé : cas limite en tête, flux principal dégagé</li>
          </>
        }
        no={
          <>
            <li><code>&amp;&amp;</code> avec une valeur non booléenne (nombre) : <code>0</code> serait rendu</li>
            <li>Les ternaires imbriqués : extraire un composant ou un booléen nommé</li>
            <li>Un <code>&amp;&amp;</code> pour 3+ branches : écrivez un ternaire ou un switch</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Un « 0 » ou « NaN » affiché à l'écran", cause: "condition && <X/> avec une condition numérique — convertissez en boolean (!!length ou length > 0)." },
          { symptom: "Branche « sinon » qui masque la vraie logique", cause: "Trois branches et plus : extrayez en booléens nommés ou en composant dédié." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Bases" },
          { label: "À retenir", value: "Ternaire : 2 branches · && : 1 branche · retour anticipé : cas limite" },
        ]}
      />
    </>
  );
}