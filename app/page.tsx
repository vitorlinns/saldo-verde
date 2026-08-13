import Header from '../components/header/header';
import HeroSection from '../pages/home/sections/hero';
import Testimonials from '../pages/home/sections/testimonials';
import Pricing from '../pages/home/sections/pricing';
import Start from '../pages/home/sections/start';
import Range from '../components/ui/range/range';
import Resources from '../pages/home/sections/resources';
import Spreadsheet from '../pages/home/sections/spreadsheet';
import Faq from '../pages/home/sections/faq';
import Footer from '../pages/home/sections/footer';

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <Range />
      <Resources />
      <Spreadsheet />
      <Testimonials />
      <Pricing />
      <Start />
      <Faq />
      <Footer />
    </main>
  );
}
