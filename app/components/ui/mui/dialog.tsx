// Pourquoi : Dialog MUI — la version Material du dialogue accessible.
// Même contrat : open, onClose, title, children, className.
// MUI fournit aria-modal, le piège de focus et Échap nativement.

import { type ReactNode, type Ref } from "react";
import MuiDialog from "@mui/material/Dialog";
import MuiDialogTitle from "@mui/material/DialogTitle";
import MuiDialogContent from "@mui/material/DialogContent";

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
      className={className}
      slotProps={{
        paper: { sx: { borderRadius: 2, maxWidth: 480, width: "100%" } },
      }}
    >
      <MuiDialogTitle sx={{ px: 3, pt: 2.5 }}>{title}</MuiDialogTitle>
      <MuiDialogContent sx={{ px: 3, pb: 3, pt: 1 }}>{children}</MuiDialogContent>
    </MuiDialog>
  );
}