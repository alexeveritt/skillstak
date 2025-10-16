// app/routes/$.tsx
export function loader() {
  // Return 404 for unmatched routes without logging errors
  return new Response(null, { status: 404 });
}

export default function NotFound() {
  return null;
}
