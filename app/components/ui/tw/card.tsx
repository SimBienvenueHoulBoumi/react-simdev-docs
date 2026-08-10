// Pourquoi : conteneur de surface avec titre et description, sans bouton ni action.
// Le header est optionnel : on passe children directement.

import { type ReactNode, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface CardProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export function Card({ className, ref, children }: CardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  className?: string;
  children?: ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return <div className={cn("flex flex-col gap-1 p-6 pb-0", className)}>{children}</div>;
}

export interface CardTitleProps {
  className?: string;
  children?: ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return <h3 className={cn("text-lg font-semibold leading-none", className)}>{children}</h3>;
}

export interface CardDescriptionProps {
  className?: string;
  children?: ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export interface CardContentProps {
  className?: string;
  children?: ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn("p-6 pt-4", className)}>{children}</div>;
}

export interface CardFooterProps {
  className?: string;
  children?: ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>;
}