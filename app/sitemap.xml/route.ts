import { getSiteUrl } from "@/lib/seo";

export async function GET() {
  const site = getSiteUrl();

  const pages = [
    "/",
    "/products",
    "/design-studio/select",
    "/new-arrivals",
    "/contact",
    "/auth/login",
    "/about",
    "/wishlist",
    "/cart",
    "/profile",
  ];

  const urls = pages
    .map((p) => {
      return `<url><loc>${site}${p}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
