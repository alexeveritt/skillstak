// app/entry.server.tsx
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { renderToString } from "react-dom/server";
import { isbot } from "isbot";

export default async function handleRequest(
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
