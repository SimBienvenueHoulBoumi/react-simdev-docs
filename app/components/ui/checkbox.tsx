// Pourquoi : façade Checkbox — dispatch tailwind/mui, même contrat.

import { EngineSwitch } from "~/lib/style-engine";
import { Checkbox as TwCheckbox, type CheckboxProps as TwProps } from "./tw/checkbox";
import { Checkbox as MuiCheckbox, type CheckboxProps as MuiProps } from "./mui/checkbox";

export type CheckboxProps = TwProps;

export function Checkbox(props: CheckboxProps) {
  return (
    <EngineSwitch
      tailwind={<TwCheckbox {...(props as TwProps)} />}
      mui={<MuiCheckbox {...(props as MuiProps)} />}
    />
  );
}