import Banners from "./sections/banners/banners";
import BestSeller from "./sections/bestseller/bestseller";
import Branding from "./sections/brandingsection/branding";
import Cards from "./sections/cards/cards";
import Collections from "./sections/collections/collection";
import Designing from "./sections/designing/designing";
// import Enquiry from './sections/enquiry/enquiry';
import Hero from "./sections/hero/hero";
import { createMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/lib/BreadcrumbJsonLd";

export async function generateMetadata() {
  return createMetadata({
    title: "Kingfox — Custom Apparel & Streetwear",
    description:
      "Discover Kingfox's collection of custom apparel and streetwear. Customize your designs, browse new arrivals, and shop exclusive drops.",
    pathname: "/",
  });
}
import HotDeals from "./sections/hotdeals/hotdeals";
import LimitedDeals from "./sections/limiteddeals/limiteddeals";

export default function HomePage() {
  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          {
            name: "Home",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/`,
          },
        ]}
      />
      <Hero />
      <BestSeller />
      <Banners />
      <Collections />
      <Cards />
      <HotDeals />
      <LimitedDeals />
      <Designing />
      {/* <Enquiry/> */}
      <Branding />
      {/* Next: Your "New Arrivals" section */}
    </main>
  );
}
