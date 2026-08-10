// Pourquoi : façade Skeleton — dispatch tailwind/mui, même contrat (la forme en className).

import { EngineSwitch } from "~/lib/style-engine";
import { Skeleton as TwSkeleton, type SkeletonProps as TwProps } from "./tw/skeleton";
import { Skeleton as MuiSkeleton, type SkeletonProps as MuiProps } from "./mui/skeleton";

export type SkeletonProps = TwProps;

export function Skeleton(props: SkeletonProps) {
  return (
    <EngineSwitch
      tailwind={<TwSkeleton {...(props as TwProps)} />}
      mui={<MuiSkeleton {...(props as MuiProps)} />}
    />
  );
}