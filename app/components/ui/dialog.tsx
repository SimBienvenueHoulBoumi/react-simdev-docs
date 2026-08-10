// Pourquoi : façade Dialog — dispatch tailwind/mui, même contrat.
// Les comportements a11y diffèrent par implémentation (trap maison vs MUI).

import { EngineSwitch } from "~/lib/style-engine";
import { Dialog as TwDialog, type DialogProps as TwProps } from "./tw/dialog";
import { Dialog as MuiDialog, type DialogProps as MuiProps } from "./mui/dialog";

export type DialogProps = TwProps;

export function Dialog(props: DialogProps) {
  return (
    <EngineSwitch
      tailwind={<TwDialog {...(props as TwProps)} />}
      mui={<MuiDialog {...(props as MuiProps)} />}
    />
  );
}