// Pourquoi : façade Textarea — dispatch tailwind/mui, même contrat.

import { EngineSwitch } from "~/lib/style-engine";
import { Textarea as TwTextarea, type TextareaProps as TwProps } from "./tw/textarea";
import { Textarea as MuiTextarea, type TextareaProps as MuiProps } from "./mui/textarea";

export type TextareaProps = TwProps;

export function Textarea(props: TextareaProps) {
  return (
    <EngineSwitch
      tailwind={<TwTextarea {...(props as TwProps)} />}
      mui={<MuiTextarea {...(props as MuiProps)} />}
    />
  );
}