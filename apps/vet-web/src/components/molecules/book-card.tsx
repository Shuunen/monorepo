import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@monorepo/components";
import { Link } from "@tanstack/react-router";

import type { ReactNode } from "react";

type BookCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  features: Array<{
    icon: ReactNode;
    heading: string;
    text: string;
  }>;
  buttonText: string;
  buttonTo: string;
};

export function BookCard({ icon, title, description, features, buttonText, buttonTo }: BookCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center pt-2 text-2xl text-primary">
            {icon}
            {title}
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features.map(feature => (
            <div className="flex items-start" key={feature.heading}>
              {feature.icon}
              <div>
                <h3 className="font-medium">{feature.heading}</h3>
                <p className="text-gray-600">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 pb-4">
        <Link to={buttonTo}>
          <Button name={buttonText} variant="default">
            {buttonText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
