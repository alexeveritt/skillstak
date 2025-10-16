import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import stylesHref from "./styles.css?url";
import { getSession } from "./server/session";
import { Header } from "./components/Header";

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
    <html lang="en" className="h-full bg-slate-50">
      <head>
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
      <body className="min-h-screen text-slate-900">
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
