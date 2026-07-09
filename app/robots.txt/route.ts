import { getSiteUrl } from "@/lib/seo";

export async function GET() {
  const site = getSiteUrl();
  const txt = `User-agent: *
Disallow:

Sitemap: ${site}/sitemap.xml
`;

  return new Response(txt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
