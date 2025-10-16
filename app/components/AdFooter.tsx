
// app/components/AdFooter.tsx
import { useLoaderData } from "react-router";
export function AdFooter() {
  const { adsense } = useLoaderData() as { adsense?: string };
  if (!adsense) return null;
  return (
    <div className="mt-6">
      <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={adsense} data-ad-slot="1234567890" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script dangerouslySetInnerHTML={{ __html: "(adsbygoogle = window.adsbygoogle || []).push({});" }} />
    </div>
  );
}
