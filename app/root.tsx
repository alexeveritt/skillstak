import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import stylesHref from "./styles.css?url";
import { getSession } from "./server/session";
import { Header } from "./components/Header";
import { ErrorPage } from "./components/ErrorPage";

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
    <html lang="en" className="h-full">
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
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en" className="h-full">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Error {error.status} - SkillStak</title>
          <Meta />
          <Links />
        </head>
        <body className="min-h-screen">
          <Header userId={null} />
          <main className="mx-auto max-w-3xl p-4">
            <ErrorPage status={error.status} statusText={error.statusText} message={error.data?.message} />
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
        <title>Error - SkillStak</title>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen">
        <Header userId={null} />
        <main className="mx-auto max-w-3xl p-4">
          <ErrorPage status={500} message={error instanceof Error ? error.message : "An unexpected error occurred"} />
        </main>
        <Scripts />
      </body>
    </html>
  );
}
