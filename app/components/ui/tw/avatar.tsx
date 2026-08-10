// Pourquoi : avatar avec fallback initiales quand pas d'image.
// Accepte imgSrc OU name : ne connaît pas la forme de ses données.

import { type Ref } from "react";
import { cn } from "~/lib/cn";

export interface AvatarProps {
  /** URL de l'image ; si absente ou en erreur → initiales de `name` */
  imgSrc?: string;
  /** Nom complet utilisé pour les initiales et aria-label */
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}

const sizes = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
} as const;

export function Avatar({ imgSrc, name, size = "md", className, ref }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      ref={ref}
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground",
        sizes[size],
        className,
      )}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt=""
          className="size-full object-cover"
          onError={(e) => {
            // Image en échec → on la retire pour montrer les initiales
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        initials
      )}
    </span>
  );
}