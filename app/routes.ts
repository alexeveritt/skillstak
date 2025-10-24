// app/routes.ts
import { index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("reset", "routes/reset.request.tsx"),
  route("reset/:token", "routes/reset.$token.tsx"),

  // Project routes with shared layout
  route("p/:projectId", "routes/p.$projectId.tsx", [
    index("routes/p.$projectId._index.tsx"),
    route("edit", "routes/p.$projectId.edit.tsx"),
    route("review", "routes/p.$projectId.review.tsx"),
    route("cards", "routes/p.$projectId.cards._index.tsx"),
    route("cards/import", "routes/p.$projectId.cards.import.tsx"),
    route("cards/export", "routes/p.$projectId.cards.export.tsx"),
  ]),

  // Catch-all for .well-known and other 404s
  route("*", "routes/$.tsx"),
];
