// Pourquoi : Dialog MUI — la version Material du dialogue accessible.
// Même contrat : open, onClose, title, children, className.
// MUI fournit aria-modal, le piège de focus et Échap nativement.

import { type ReactNode, type Ref } from "react";
import MuiDialog from "@mui/material/Dialog";
import MuiDialogTitle from "@mui/material/DialogTitle";
import MuiDialogContent from "@mui/material/DialogContent";
import { cn } from "~/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function Dialog({ open, onClose, title, children, className, ref }: DialogProps) {
  return (
    <MuiDialog
      ref={ref}
      open={open}
      onClose={onClose}
      aria-labelledby={undefined}
      className={cn(className)}
      slotProps={{
        paper: { sx: { borderRadius: 2, maxWidth: 480, width: "100%" } },
      }}
    >
      <MuiDialogTitle className="px-6 pt-5">{title}</MuiDialogTitle>
      <MuiDialogContent className="px-6 pb-6 pt-2">{children}</MuiDialogContent>
    </MuiDialog>
  );
}