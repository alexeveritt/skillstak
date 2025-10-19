// app/entry.server.tsx
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { renderToString } from "react-dom/server";
import { isbot } from "isbot";

async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext
) {
  const html = renderToString(<ServerRouter context={entryContext} url={request.url} />);

  responseHeaders.set("Content-Type", "text/html");
  return new Response(html, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

export default {
  async fetch(request: Request, env: any, ctx: any) {
    // You may need to adapt entryContext to your framework's needs
    // Here, we use a minimal placeholder for entryContext
    const entryContext = {} as EntryContext;
    return handleRequest(request, 200, new Headers(), entryContext);
  }
};
