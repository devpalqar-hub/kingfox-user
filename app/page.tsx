import Banners from './sections/banners/banners';
import BestSeller from './sections/bestseller/bestseller';
import Branding from './sections/brandingsection/branding';
import Cards from './sections/cards/cards';
import Collections from './sections/collections/collection';
import Designing from './sections/designing/designing';
// import Enquiry from './sections/enquiry/enquiry';
import Hero from './sections/hero/hero';
import HotDeals from './sections/hotdeals/hotdeals';
import LimitedDeals from './sections/limiteddeals/limiteddeals';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Banners/>
      <Collections/>
      <Cards/>
      <BestSeller/>
      <HotDeals/>
      <LimitedDeals/>
      <Designing/>
      {/* <Enquiry/> */}
      <Branding/>
      {/* Next: Your "New Arrivals" section */}
    </main>
  );
}