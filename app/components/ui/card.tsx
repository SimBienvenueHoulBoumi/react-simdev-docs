// Pourquoi : façade Card — dispatch tailwind/mui, même contrat par sous-composant.

import { EngineSwitch } from "~/lib/style-engine";
import {
  Card as TwCard,
  CardHeader as TwCardHeader,
  CardTitle as TwCardTitle,
  CardDescription as TwCardDescription,
  CardContent as TwCardContent,
  CardFooter as TwCardFooter,
  type CardProps as TwCardProps,
} from "./tw/card";
import {
  Card as MuiCard,
  CardHeader as MuiCardHeader,
  CardTitle as MuiCardTitle,
  CardDescription as MuiCardDescription,
  CardContent as MuiCardContent,
  CardFooter as MuiCardFooter,
  type CardProps as MuiCardProps,
} from "./mui/card";

export type CardProps = TwCardProps;

export function Card(props: CardProps) {
  return (
    <EngineSwitch
      tailwind={<TwCard {...(props as TwCardProps)} />}
      mui={<MuiCard {...(props as MuiCardProps)} />}
    />
  );
}

type SubProps = TwCardProps;

export function CardHeader(props: SubProps) {
  return (
    <EngineSwitch
      tailwind={<TwCardHeader {...(props as TwCardProps)} />}
      mui={<MuiCardHeader {...(props as MuiCardProps)} />}
    />
  );
}

export function CardTitle(props: SubProps) {
  return (
    <EngineSwitch
      tailwind={<TwCardTitle {...(props as TwCardProps)} />}
      mui={<MuiCardTitle {...(props as MuiCardProps)} />}
    />
  );
}

export function CardDescription(props: SubProps) {
  return (
    <EngineSwitch
      tailwind={<TwCardDescription {...(props as TwCardProps)} />}
      mui={<MuiCardDescription {...(props as MuiCardProps)} />}
    />
  );
}

export function CardContent(props: SubProps) {
  return (
    <EngineSwitch
      tailwind={<TwCardContent {...(props as TwCardProps)} />}
      mui={<MuiCardContent {...(props as MuiCardProps)} />}
    />
  );
}

export function CardFooter(props: SubProps) {
  return (
    <EngineSwitch
      tailwind={<TwCardFooter {...(props as TwCardProps)} />}
      mui={<MuiCardFooter {...(props as MuiCardProps)} />}
    />
  );
}