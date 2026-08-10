// Pourquoi : façade Input — dispatch tailwind/mui, même contrat.

import { EngineSwitch } from "~/lib/style-engine";
import { Input as TwInput, type InputProps as TwProps } from "./tw/input";
import { Input as MuiInput, type InputProps as MuiProps } from "./mui/input";

export type InputProps = TwProps;

export function Input(props: InputProps) {
  return (
    <EngineSwitch
      tailwind={<TwInput {...(props as TwProps)} />}
      mui={<MuiInput {...(props as MuiProps)} />}
    />
  );
}