// Pourquoi : façade Button — rend l'implémentation selon le moteur actif.
// Le contrat de props est défini ici et partagé par tw/ et mui/.
// `as` reste polymorphe : bouton, lien, ou composant.

import { type ComponentPropsWithoutRef, type ElementType, type ReactNode, type Ref } from "react";
import { EngineSwitch } from "~/lib/style-engine";
import { Button as TwButton } from "./tw/button";
import { Button as MuiButton } from "./mui/button";

export interface ButtonProps<T extends ElementType = "button"> {
  as?: T;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  loadingLabel?: ReactNode;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}

export function Button<T extends ElementType = "button">(
  props: ButtonProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>,
) {
  // Les deux implémentations partagent le même contrat : cast sans risque
  return (
    <EngineSwitch
      tailwind={<TwButton {...(props as ComponentPropsWithoutRef<T> & ButtonProps)} />}
      mui={<MuiButton {...(props as ComponentPropsWithoutRef<T> & ButtonProps)} />}
    />
  );
}