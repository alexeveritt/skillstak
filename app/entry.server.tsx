// app/entry.server.tsx

import { isbot } from "isbot";
import { PassThrough } from "node:stream";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  loadContext: AppLoadContext
) {
  return new Promise((resolve, reject) => {
    const userAgent = request.headers.get("user-agent");
    let shellRendered = false;

    // Dynamically import the correct renderer based on environment
    const isCloudflare = typeof process === "undefined" || process.env.CLOUDFLARE_MODE === "true";

    if (isCloudflare) {
      // Use renderToReadableStream for Cloudflare Workers
      import("react-dom/server")
        .then(async (ReactDOMServer) => {
          const { renderToReadableStream } = ReactDOMServer;

          const body = await renderToReadableStream(
            <ServerRouter context={entryContext} url={request.url} />,
            {
              signal: request.signal,
              onError(error: unknown) {
                console.error(error);
                responseStatusCode = 500;
              },
            }
          );

          if (isbot(userAgent)) {
            await body.allReady;
          }

          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        })
        .catch(reject);
    } else {
      // Use renderToPipeableStream for Node.js
      import("react-dom/server")
        .then((ReactDOMServer) => {
          const { renderToPipeableStream } = ReactDOMServer;

          const { pipe, abort } = renderToPipeableStream(
            <ServerRouter context={entryContext} url={request.url} />,
            {
              onShellReady() {
                shellRendered = true;
                const body = new PassThrough();
                const stream = new ReadableStream({
                  start(controller) {
                    body.on("data", (chunk: Buffer) => {
                      controller.enqueue(chunk);
                    });
                    body.on("end", () => {
                      controller.close();
                    });
                    body.on("error", (error) => {
                      controller.error(error);
                    });
                  },
                  cancel() {
                    abort();
                  },
                });

                responseHeaders.set("Content-Type", "text/html");
                resolve(
                  new Response(stream, {
                    headers: responseHeaders,
                    status: responseStatusCode,
                  })
                );

                pipe(body);
              },
              onShellError(error: unknown) {
                reject(error);
              },
              onError(error: unknown) {
                console.error(error);
                responseStatusCode = 500;

                if (shellRendered) {
                  console.error("Error after shell rendered:", error);
                }
              },
            }
          );

          setTimeout(abort, 10000);
        })
        .catch(reject);
    }
  });
}
