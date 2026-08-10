// Pourquoi : Avatar MUI — la version Material de l'avatar avec repli initiales.
// Même contrat : imgSrc, name, size, className, ref. MUI gère le repli
// automatiquement quand src échoue (alt = initiales en children).

import { type Ref } from "react";
import MuiAvatar from "@mui/material/Avatar";

export interface AvatarProps {
  imgSrc?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const px = { sm: 28, md: 36, lg: 48 } as const;
const fontPx = { sm: 12, md: 14, lg: 16 } as const;

export function Avatar({ imgSrc, name, size = "md", className, ref }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <MuiAvatar
      ref={ref}
      src={imgSrc}
      alt={name}
      title={name}
      className={className}
      sx={{
        width: px[size],
        height: px[size],
        fontSize: fontPx[size],
        bgcolor: "primary.main",
      }}
    >
      {initials}
    </MuiAvatar>
  );
}