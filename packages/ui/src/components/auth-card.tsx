import * as React from "react";

import { cn } from "../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

const AuthCard = React.forwardRef<HTMLDivElement, AuthCardProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("border-border/60 shadow-lg", className)}
        {...props}
      >
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    );
  }
);
AuthCard.displayName = "AuthCard";

export { AuthCard };
