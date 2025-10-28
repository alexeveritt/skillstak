import { I18nextProvider } from "react-i18next";
import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  RouterProvider,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "react-router";
import { Toaster } from "sonner";
import { ErrorPage } from "./components/ErrorPage";
import { Header } from "./components/Header";
import i18n from "./lib/i18n";
import { getSession } from "./server/session";
import stylesHref from "./styles.css?url";
import { useTranslation } from "react-i18next";
import { getEnvFromContext } from "~/server/db";
import { withSentryReactRouterV7Routing } from "@sentry/react";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesHref }];

export async function loader({ context, request }: LoaderFunctionArgs) {
  const session = await getSession(context, request);
  const env = getEnvFromContext(context);

  console.log("[Root Loader] SENTRY_DSN:", env.SENTRY_DSN);
  console.log("[Root Loader] SENTRY_ENVIRONMENT:", env.SENTRY_ENVIRONMENT);

  return {
    userId: session?.userId ?? null,
    adsense: env.ADSENSE_CLIENT || "",
    googleSiteVerification: env.GOOGLE_SITE_VERIFICATION || "",
    sentryDsn: env.SENTRY_DSN || "",
    sentryEnvironment: env.SENTRY_ENVIRONMENT || "",
  };
}

// Wrap the RouterProvider with Sentry
const SentryRouterProvider = withSentryReactRouterV7Routing(RouterProvider);

export default function Root() {
  const { userId, adsense, googleSiteVerification, sentryDsn, sentryEnvironment } = useLoaderData<typeof loader>();
  return (
    <I18nextProvider i18n={i18n}>
      <html lang={i18n.language || "en"} className="h-full">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          {googleSiteVerification ? <meta name="google-site-verification" content={googleSiteVerification} /> : null}
          <Meta />
          <Links />
          {adsense ? (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`}
              crossOrigin="anonymous"
            ></script>
          ) : null}
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify({ SENTRY_DSN: sentryDsn, SENTRY_ENVIRONMENT: sentryEnvironment })}`,
            }}
          />
        </head>
        <body className="min-h-screen">
          <Header userId={userId} />
          <main className="mx-auto max-w-3xl p-4">
            <Outlet />
          </main>
          <Toaster position="top-center" richColors />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </I18nextProvider>
  );
}

function ErrorBoundaryContent() {
  const error = useRouteError();
  const { t } = useTranslation();

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en" className="h-full">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{t("error.title", { status: error.status })}</title>
          <Meta />
          <Links />
        </head>
        <body className="min-h-screen">
          <Header userId={null} />
          <main className="mx-auto max-w-3xl p-4">
            <ErrorPage
              status={error.status}
              statusText={error.statusText}
              message={error.data?.message ? t("error.message", { message: error.data?.message }) : undefined}
            />
          </main>
          <Scripts />
        </body>
      </html>
    );
  }

  // Handle unexpected errors
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t("error.titleDefault")}</title>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen">
        <Header userId={null} />
        <main className="mx-auto max-w-3xl p-4">
          <ErrorPage
            status={500}
            message={
              error instanceof Error ? t("error.unexpected", { message: error.message }) : t("error.unexpectedDefault")
            }
          />
        </main>
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundaryContent />
    </I18nextProvider>
  );
}

function App() {
  return <SentryRouterProvider />;
}
