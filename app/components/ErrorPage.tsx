// app/components/ErrorPage.tsx
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertCircle, Home, LogIn, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  status?: number;
  statusText?: string;
  message?: string;
}

export function ErrorPage({ status, statusText, message }: ErrorPageProps) {
  // Determine user-friendly error details based on status code
  const getErrorDetails = () => {
    switch (status) {
      case 401:
        return {
          title: "Please Sign In",
          description: "You need to be logged in to access this page.",
          userMessage:
            "It looks like your session has expired or you haven't logged in yet. Please sign in to continue using SkillStak.",
          showLoginButton: true,
          icon: <LogIn className="h-12 w-12 text-muted-foreground" />,
        };
      case 403:
        return {
          title: "Access Denied",
          description: "You don't have permission to view this page.",
          userMessage:
            "Sorry, you don't have the necessary permissions to access this content. If you believe this is a mistake, please contact support.",
          showLoginButton: false,
          icon: <AlertCircle className="h-12 w-12 text-destructive" />,
        };
      case 404:
        return {
          title: "Page Not Found",
          description: "The page you're looking for doesn't exist.",
          userMessage:
            "We couldn't find what you were looking for. The page might have been moved or deleted. Try going back to the home page.",
          showLoginButton: false,
          icon: <AlertCircle className="h-12 w-12 text-muted-foreground" />,
        };
      case 500:
        return {
          title: "Something Went Wrong",
          description: "An unexpected error occurred on our end.",
          userMessage:
            "We're sorry, but something went wrong on our servers. Our team has been notified. Please try refreshing the page or come back later.",
          showLoginButton: false,
          icon: <AlertCircle className="h-12 w-12 text-destructive" />,
        };
      default:
        return {
          title: "Oops! Something Went Wrong",
          description: statusText || "An unexpected error occurred.",
          userMessage:
            message ||
            "We encountered an unexpected problem. Please try refreshing the page or going back to the home page.",
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
                  Sign In
                </Link>
              </Button>
            )}

            <Button asChild variant={errorDetails.showLoginButton ? "outline" : "default"} size="lg">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>

            {status && status >= 500 && (
              <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>

          {status && <p className="text-xs text-center text-muted-foreground mt-4">Error code: {status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
