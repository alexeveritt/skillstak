// app/components/Header.tsx
import { Form, NavLink } from "react-router";

export function Header({ userId }: { userId?: string | null }) {
  return (
    <header className="mx-auto max-w-3xl p-4 flex items-center justify-between">
      <NavLink to="/" className="font-semibold">Spaced</NavLink>
      <nav className="flex gap-4 text-sm items-center">
        {userId ? (
          <Form method="post" action="/logout">
            <button className="underline">Logout</button>
          </Form>
        ) : (
          <>
            <NavLink to="/login" className="underline">Login</NavLink>
            <NavLink to="/signup" className="underline">Sign up</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
