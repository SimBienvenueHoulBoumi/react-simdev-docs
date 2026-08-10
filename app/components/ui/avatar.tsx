// Pourquoi : façade Avatar — dispatch tailwind/mui, même contrat.

import { EngineSwitch } from "~/lib/style-engine";
import { Avatar as TwAvatar, type AvatarProps as TwProps } from "./tw/avatar";
import { Avatar as MuiAvatar, type AvatarProps as MuiProps } from "./mui/avatar";

export type AvatarProps = TwProps;

export function Avatar(props: AvatarProps) {
  return (
    <EngineSwitch
      tailwind={<TwAvatar {...(props as TwProps)} />}
      mui={<MuiAvatar {...(props as MuiProps)} />}
    />
  );
}