// app/routes.ts
import type { RouteObject } from "react-router";

/**
 * RR7 "lazy route modules" — each `lazy` import should export:
 *   - default (Component)
 *   - optional loader/action/links
 * which our scaffolded files already do.
 */
const routes = [
  {
    id: "layout",
    path: "/",
    file: "./root.tsx",
    children: [
      // /  (projects list)
      { index: true, file: "./routes/_index.tsx" },

      // auth
      { path: "login", file: "./routes/login.tsx" },
      { path: "signup", file: "./routes/signup.tsx" },
      { path: "logout", file: "./routes/logout.tsx" },

      // password reset
      { path: "reset", file: "./routes/reset.request.tsx" },
      { path: "reset/:token", file: "./routes/reset.$token.tsx" },

      // project & cards
      { path: "p/:projectId", file: "./routes/p.$projectId._index.tsx" },
      { path: "p/:projectId/review", file: "./routes/p.$projectId.review.tsx" },
      { path: "p/:projectId/cards/new", file: "./routes/p.$projectId.cards.new.tsx" },
      { path: "p/:projectId/cards/:cardId/edit", file: "./routes/p.$projectId.cards.$cardId.edit.tsx" },
    ],
  },
];

export default routes;
