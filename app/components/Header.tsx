// app/components/Header.tsx
import { Form, NavLink } from "react-router";
import { Button } from "~/components/ui/button";

export function Header({ userId }: { userId?: string | null }) {
  return (
    <header className="mx-auto max-w-3xl p-4 flex items-center justify-between">
      <NavLink to="/" className="font-semibold text-lg">
        SkillStak
      </NavLink>
      <nav className="flex gap-2 text-sm items-center">
        {userId ? (
          <Form method="post" action="/logout">
            <Button variant="ghost" size="sm">
              Logout
            </Button>
          </Form>
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild>
              <NavLink to="/login">Login</NavLink>
            </Button>
            <Button size="sm" asChild>
              <NavLink to="/signup">Sign up</NavLink>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
