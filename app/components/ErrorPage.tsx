// app/components/ErrorPage.tsx

import { AlertCircle, Home, LogIn, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

interface ErrorPageProps {
  status?: number;
  statusText?: string;
  message?: string;
}

export function ErrorPage({ status, statusText, message }: ErrorPageProps) {
  const { t } = useTranslation();
  // Determine user-friendly error details based on status code
  const getErrorDetails = () => {
    switch (status) {
      case 401:
        return {
          title: t("error.401.title"),
          description: t("error.401.description"),
          userMessage: t("error.401.userMessage"),
          showLoginButton: true,
          icon: <LogIn className="h-12 w-12 text-muted-foreground" />,
        };
      case 403:
        return {
          title: t("error.403.title"),
          description: t("error.403.description"),
          userMessage: t("error.403.userMessage"),
          showLoginButton: false,
          icon: <AlertCircle className="h-12 w-12 text-destructive" />,
        };
      case 404:
        return {
          title: t("error.404.title"),
          description: t("error.404.description"),
          userMessage: t("error.404.userMessage"),
          showLoginButton: false,
          icon: <AlertCircle className="h-12 w-12 text-muted-foreground" />,
        };
      case 500:
        return {
          title: t("error.500.title"),
          description: t("error.500.description"),
          userMessage: t("error.500.userMessage"),
          showLoginButton: false,
          icon: <AlertCircle className="h-12 w-12 text-destructive" />,
        };
      default:
        return {
          title: t("error.default.title"),
          description: statusText || t("error.default.description"),
          userMessage: message || t("error.default.userMessage"),
          showLoginButton: false,
          icon: <AlertCircle className="h-12 w-12 text-muted-foreground" />,
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{errorDetails.icon}</div>
          <CardTitle className="text-3xl">{errorDetails.title}</CardTitle>
          <CardDescription className="text-base">{errorDetails.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">{errorDetails.userMessage}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {errorDetails.showLoginButton && (
              <Button asChild size="lg">
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  {t("error.button.signIn")}
                </Link>
              </Button>
            )}

            <Button asChild variant={errorDetails.showLoginButton ? "outline" : "default"} size="lg">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                {t("error.button.goHome")}
              </Link>
            </Button>

            {status && status >= 500 && (
              <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("error.button.refresh")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
