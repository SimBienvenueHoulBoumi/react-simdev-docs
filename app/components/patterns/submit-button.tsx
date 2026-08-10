// Pourquoi : un bouton de soumission ne doit jamais laisser croire que rien ne
// se passe. Pendant l'envoi il se désactive (anti double-soumission), affiche un
// spinner et change de libellé — l'utilisateur sait que sa validation est partie.
//
// L'état vient de React Router : `useNavigation()` pour un <Form> classique,
// `fetcher.state` quand la soumission passe par un fetcher. Le composant ne
// devine rien, il lit l'état réel de la requête.

"use client";

import { type ReactNode } from "react";
import { useNavigation } from "react-router";
import { Button, type ButtonProps } from "~/components/ui/button";

export interface SubmitButtonProps extends Omit<ButtonProps<"button">, "as"> {
  /** Libellé pendant l'envoi (défaut : « Enregistrement… ») */
  loadingLabel?: ReactNode;
  /** État d'un fetcher, quand la soumission ne passe pas par la navigation.
   *  Fourni : il fait autorité ; absent : on lit useNavigation(). */
  fetcherState?: "idle" | "loading" | "submitting";
}

export function SubmitButton({
  children,
  loadingLabel = "Enregistrement…",
  fetcherState,
  disabled,
  ...rest
}: SubmitButtonProps) {
  const navigation = useNavigation();
  // « submitting » seulement : pendant « loading » la mutation est déjà partie
  // et la page recharge ses données — le bouton n'a plus à retenir l'utilisateur.
  const envoi =
    fetcherState !== undefined
      ? fetcherState === "submitting"
      : navigation.state === "submitting";

  return (
    <Button
      type="submit"
      isLoading={envoi}
      loadingLabel={loadingLabel}
      disabled={disabled ?? envoi}
      {...rest}
    >
      {children}
    </Button>
  );
}
