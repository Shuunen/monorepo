import type { ComponentProps } from "react";
import { CardTitle as ShadCardTitle } from "../shadcn/card";

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader } from "../shadcn/card";

// TODO : ideally we add data-testid handling (and other customizations) like in button.tsx instead of just exposing the raw shadcn component

export function CardTitle(props: ComponentProps<typeof ShadCardTitle>) {
  return <ShadCardTitle data-testid="card-title" {...props} />;
}
