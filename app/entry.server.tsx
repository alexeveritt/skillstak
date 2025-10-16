// app/entry.server.tsx
import type { AppLoadContext } from "react-router";
import { RemixServer } from "react-router";
import { renderToReadableStream } from "react-dom/server";

export default function handleRequest(request: Request, statusCode: number, headers: Headers, context: AppLoadContext) {
  return renderToReadableStream(<RemixServer context={context} url={request.url} />, {
    bootstrapScripts: ["/assets/entry.client.js"],
  });
}
