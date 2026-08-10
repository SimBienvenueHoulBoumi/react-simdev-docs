// Pourquoi : fiche notion — useActionState/useFormStatus : les formulaires serveur-first (spec §9.5).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// React 19 : les formulaires parlent au serveur sans cascade de fetch.
// useActionState plie l'état (valeurs + erreurs) autour de l'action.

import { useActionState } from "react";

type FormErrors = { email?: string; password?: string; form?: string };

async function loginAction(_prev: FormErrors, formData: FormData): Promise<FormErrors> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email.includes("@")) return { email: "Adresse invalide" };
  if (password.length < 8) return { password: "8 caractères minimum" };
  // …appel API ; en cas d'échec : return { form: "Identifiants refusés" }
  return {};
}

function LoginForm() {
  const [errors, formAction, isPending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="email" type="email" placeholder="Email" aria-invalid={!!errors.email} />
      {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}

      <input name="password" type="password" placeholder="Mot de passe" aria-invalid={!!errors.password} />
      {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}

      {errors.form && <p className="text-destructive text-sm">{errors.form}</p>}
      <Button type="submit" isLoading={isPending}>Se connecter</Button>
    </form>
  );
}

// useFormStatus : les PIÈCES du formulaire (leviers, boutons) lisent
// l'état de soumission sans recevoir de props — cf. compound components.
// const { pending } = useFormStatus(); // dans un <SubmitButton/> enfant`;

export const ActionStateNotion: Entry = {
  slug: "notion-action-state",
  title: "useActionState et useFormStatus",
  family: "notions",
  level: "avance",
  summary: "Les actions formulaires de React 19 : l'état d'erreur vit dans l'action, le formulaire pilote la soumission, les pièces lisent useFormStatus.",
  intents: [
    "construire un formulaire avec validations et erreurs serveur",
    "désactiver un bouton pendant la soumission sans props",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-forms", "notion-compound"],
  props: ["useActionState", "useFormStatus", "action", "formData", "isPending"],
  Doc: ActionStateDoc,
};

function ActionStateDoc() {
  return (
    <>
      <Concept>
        <p>
          Avant React 19, un formulaire = état local + validation + fetch + gestion
          d'erreurs, répartis partout. Avec <code>useActionState</code>, l'action
          devient la propriétaire de tout ça : elle reçoit le{" "}
          <code className="font-mono text-[13px]">FormData</code>, retourne les erreurs,
          et le hook expose l'état (<code className="font-mono text-[13px]">errors</code>)
          et l'indicateur (<code className="font-mono text-[13px]">isPending</code>).{" "}
          <code className="font-mono text-[13px]">useFormStatus</code> complète le tableau
          pour les pièces imbriquées — un bouton submit n'a pas besoin de recevoir{" "}
          <code className="font-mono text-[13px]">isPending</code> en prop.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — action-state" />

      <WhenToUse
        yes={
          <>
            <li>Tout formulaire qui envoie au serveur : une action, un état d'erreur, zéro fetch éparpillé</li>
            <li>Des validations serveur ET client : l'action centralise les deux retours</li>
            <li><code>useFormStatus</code> pour un bouton submit réutilisable qui gère son propre pending</li>
          </>
        }
        no={
          <>
            <li>Un formulaire purement local (aucune soumission) : useState suffit</li>
            <li>Imiter les erreurs côté client seulement : renvoyez aussi les erreurs réelles du serveur</li>
            <li>Une action qui mute sans gestion du retour : le contrat « previous state → result » doit être respecté</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Le formulaire se soumet mais l'état d'erreur n'existe pas", cause: "L'action doit retourner l'état précédent transformé — une action qui ne retourne rien perd les erreurs." },
          { symptom: "Le bouton est désactivé pour toujours après l'envoi", cause: "isPending géré par un état local au lieu de useActionState : l'indicateur doit suivre le cycle réel de l'action." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé" },
          { label: "À retenir", value: "L'action porte l'état ; le formulaire porte l'action ; useFormStatus pour les pièces" },
        ]}
      />
    </>
  );
}