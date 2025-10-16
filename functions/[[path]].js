// functions/[[path]].js
import { createPagesFunctionHandler } from "@react-router/cloudflare";
import * as build from "../build/server/index.js";

export const onRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
});
