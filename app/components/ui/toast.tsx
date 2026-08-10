// Pourquoi : façade Toast — dispatch tailwind/mui, même contrat (provider + hook).
// Pont de contexte : chaque implémentation garde SA useToast, le pont remonte
// la fonction du provider effectivement monté — aucun hook conditionnel.

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { EngineSwitch } from "~/lib/style-engine";
import {
  ToastProvider as TwProvider,
  useToast as twUseToast,
  type ToastOptions as TwOptions,
} from "./tw/toast";
import {
  ToastProvider as MuiProvider,
  useToast as muiUseToast,
  type ToastOptions as MuiOptions,
} from "./mui/toast";

export type ToastOptions = TwOptions;
export type ToastVariant = "default" | "success" | "destructive";

interface ToastFn {
  toast: (title: string, options?: ToastOptions) => void;
}

const BridgeContext = createContext<ToastFn | null>(null);

function TwBridge({ children }: { children: ReactNode }) {
  const { toast } = twUseToast();
  const value = useMemo(() => ({ toast }), [toast]);
  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
}

function MuiBridge({ children }: { children: ReactNode }) {
  const { toast } = muiUseToast();
  const value = useMemo(() => ({ toast: toast as ToastFn["toast"] }), [toast]);
  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
}

export function ToastProvider({ children }: { children?: ReactNode }) {
  return (
    <EngineSwitch
      tailwind={
        <TwProvider>
          <TwBridge>{children}</TwBridge>
        </TwProvider>
      }
      mui={
        <MuiProvider>
          <MuiBridge>{children}</MuiBridge>
        </MuiProvider>
      }
    />
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>");
  return ctx;
}