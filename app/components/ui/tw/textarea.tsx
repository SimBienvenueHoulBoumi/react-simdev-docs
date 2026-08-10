// Pourquoi : textarea multiligne, même contrat que Input (error en prop).

import { type ComponentPropsWithoutRef, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, error, ref, ...rest }: TextareaProps) {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={cn(
          "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}