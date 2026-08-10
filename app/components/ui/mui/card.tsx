// Pourquoi : Card MUI — la version Material de la surface composable.
// Même contrat que tw/card.tsx : Card, CardHeader, CardTitle, CardDescription,
// CardContent, CardFooter — chacun avec className + children.

import { type ReactNode, type Ref } from "react";
import MuiCard from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export interface CardProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export function Card({ className, ref, children }: CardProps) {
  return (
    <MuiCard ref={ref} className={className} variant="outlined">
      {children}
    </MuiCard>
  );
}

export interface CardHeaderProps {
  className?: string;
  children?: ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div
      className={"MuiCardHeader-root " + (className ?? "")}
      style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 4 }}
    >
      {children}
    </div>
  );
}

export interface CardTitleProps {
  className?: string;
  children?: ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <Typography variant="h3" className={className} sx={{ fontSize: 18, fontWeight: 600 }}>
      {children}
    </Typography>
  );
}

export interface CardDescriptionProps {
  className?: string;
  children?: ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <Typography variant="body2" color="text.secondary" className={className}>
      {children}
    </Typography>
  );
}

export interface CardContentProps {
  className?: string;
  children?: ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <MuiCardContent className={className} sx={{ paddingTop: "16px" }}>
      {children}
    </MuiCardContent>
  );
}

export interface CardFooterProps {
  className?: string;
  children?: ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", padding: "0 16px 16px", gap: 8 }}
    >
      {children}
    </div>
  );
}