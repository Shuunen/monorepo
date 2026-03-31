import { Link, type RegisteredRouter, type ValidateLinkOptions } from "@tanstack/react-router";
import { Button } from "../atoms/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../atoms/card";

type Props<TRouter extends RegisteredRouter = RegisteredRouter, TOptions = unknown> = {
  title: string;
  description: string;
  action: string;
  url: ValidateLinkOptions<TRouter, TOptions>;
};

export function CardOperation<TRouter extends RegisteredRouter, TOptions>(props: Props<TRouter, TOptions>) {
  return (
    <Card className="w-full justify-between" name="operation">
      <CardHeader>
        <CardTitle className="text-md">{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="ml-auto" name={props.title} asChild>
          <Link {...props.url}>{props.action}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
