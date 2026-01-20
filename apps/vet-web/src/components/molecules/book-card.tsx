import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/components";

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

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

export function BookCard({
  icon,
  title,
  description,
  features,
  buttonText,
  buttonTo,
}: BookCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center text-2xl text-primary pt-2">
            {icon}
            {title}
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features.map((feature) => (
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
      <CardFooter className="flex justify-center pb-4 pt-2">
        <Link to={buttonTo}>
          <Button name={buttonText} variant="default">
            {buttonText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
