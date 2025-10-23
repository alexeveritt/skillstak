// app/routes/$.tsx
import { ErrorPage } from "~/components/ErrorPage";

export function loader() {
  // Return 404 for unmatched routes without logging errors
  throw new Response(null, { status: 404 });
}

export default function NotFound() {
  return <ErrorPage status={404} />;
}
