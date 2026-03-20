import type { ComponentProps } from "react";
import { Card as ShadCard, CardTitle as ShadCardTitle } from "../shadcn/card";
import { testIdFromProps, type NameProp } from "./form.utils";

export { CardAction, CardContent, CardDescription, CardFooter, CardHeader } from "../shadcn/card";

type CardProps = ComponentProps<typeof ShadCard> & NameProp;

export function Card(props: CardProps) {
  return <ShadCard data-testid={testIdFromProps("card", props)} {...props} />;
}

type CardTitleProps = ComponentProps<typeof ShadCardTitle>;

export function CardTitle(props: CardTitleProps) {
  return <ShadCardTitle data-testid="card-title" {...props} />;
}
