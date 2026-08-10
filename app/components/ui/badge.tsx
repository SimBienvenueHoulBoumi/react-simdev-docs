// Pourquoi : façade Badge — dispatch tailwind/mui sur le même contrat de props.

import { EngineSwitch } from "~/lib/style-engine";
import { Badge as TwBadge, type BadgeProps as TwProps } from "./tw/badge";
import { Badge as MuiBadge, type BadgeProps as MuiProps } from "./mui/badge";

export type BadgeProps = TwProps;

export function Badge(props: BadgeProps) {
  return (
    <EngineSwitch
      tailwind={<TwBadge {...(props as TwProps)} />}
      mui={<MuiBadge {...(props as MuiProps)} />}
    />
  );
}