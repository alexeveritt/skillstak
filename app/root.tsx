import { I18nextProvider } from "react-i18next";
import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
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

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesHref }];

export async function loader({ context, request }: LoaderFunctionArgs) {
  const session = await getSession({ request, cloudflare: context.cloudflare });
  return {
    userId: session?.userId ?? null,
    adsense: context.cloudflare?.env?.ADSENSE_CLIENT || "",
  };
}

export default function Root() {
  const { userId, adsense } = useLoaderData<typeof loader>();
  return (
    <I18nextProvider i18n={i18n}>
      <html lang={i18n.language || "en"} className="h-full">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <Meta />
          <Links />
          {adsense ? (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`}
              crossOrigin="anonymous"
            ></script>
          ) : null}
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

export function ErrorBoundary() {
  const error = useRouteError();
  const { t } = require("react-i18next");

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
