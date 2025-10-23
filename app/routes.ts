// app/routes.ts
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("reset", "routes/reset.request.tsx"),
  route("reset/:token", "routes/reset.$token.tsx"),
  route("p/:projectId", "routes/p.$projectId._index.tsx"),
  route("p/:projectId/edit", "routes/p.$projectId.edit.tsx"),
  route("p/:projectId/review", "routes/p.$projectId.review.tsx"),
  route("p/:projectId/cards", "routes/p.$projectId.cards._index.tsx"),
  route("p/:projectId/cards/new", "routes/p.$projectId.cards.new.tsx"),
  route("p/:projectId/cards/import", "routes/p.$projectId.cards.import.tsx"),
  route("p/:projectId/cards/export", "routes/p.$projectId.cards.export.tsx"),
  route("p/:projectId/cards/:cardId/edit", "routes/p.$projectId.cards.$cardId.edit.tsx"),
  // Catch-all for .well-known and other 404s
  route("*", "routes/$.tsx"),
];
