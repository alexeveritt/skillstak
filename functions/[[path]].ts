// functions/[[path]].ts
import { createRequestHandler } from "@react-router/cloudflare";
// @ts-ignore - build output may not exist during development
import * as build from "../.react-router/build/server/index.js";

export const onRequest: PagesFunction = async (context) => {
  const handler = createRequestHandler(build);
  return handler(context.request, { cloudflare: { env: context.env, ctx: context } });
};
