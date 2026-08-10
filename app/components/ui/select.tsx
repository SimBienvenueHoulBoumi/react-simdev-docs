// Pourquoi : façade Select — dispatch tailwind/mui, même contrat.
// Les children restent des <option> dans les deux implémentations.

import { EngineSwitch } from "~/lib/style-engine";
import { Select as TwSelect, type SelectProps as TwProps } from "./tw/select";
import { Select as MuiSelect, type SelectProps as MuiProps } from "./mui/select";

export type SelectProps = TwProps;

export function Select(props: SelectProps) {
  return (
    <EngineSwitch
      tailwind={<TwSelect {...(props as TwProps)} />}
      mui={<MuiSelect {...(props as MuiProps)} />}
    />
  );
}