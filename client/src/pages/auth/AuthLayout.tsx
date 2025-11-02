import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  heroTitle?: string;
  heroDescription?: string;
  className?: string;
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
  heroTitle = "PointHub Loyalty OS",
  heroDescription = "Kelola customer loyalty, POS, dan admin dashboard dalam satu aplikasi terpadu.",
  className,
}: AuthLayoutProps) {
  return (
    <div className={cn("min-h-screen w-full bg-muted/40", className)}>
      <div className="mx-auto flex min-h-screen w-full flex-col lg:max-w-6xl lg:flex-row lg:items-center lg:gap-12 lg:px-8">
        {/* Hero / Illustration */}
        <div className="hidden flex-1 flex-col justify-between rounded-[40px] bg-gradient-to-br from-primary via-primary/85 to-primary/65 p-12 text-primary-foreground shadow-2xl lg:flex">
          <div>
            <span className="rounded-full bg-primary-foreground/15 px-4 py-1 text-xs font-medium uppercase tracking-widest text-primary-foreground/80">
              Loyalty Demo
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-md text-lg text-primary-foreground/80">
              {heroDescription}
            </p>
          </div>

          <div className="rounded-3xl bg-primary-foreground/10 p-6 backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
              Demo Accounts
            </p>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/85">
              <li>• admin@demo.io / password</li>
              <li>• pos@demo.io / password</li>
              <li>• hanif@demo.io / password</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 py-16 md:py-20 lg:px-0">
          <Card className="mx-auto w-full max-w-md rounded-3xl border-border/50 shadow-lg">
            <CardHeader className="space-y-3">
              <CardTitle>{title}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">{children}</CardContent>
            {footer && (
              <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
