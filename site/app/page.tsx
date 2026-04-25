import Header from '../components/header/header';
import HeroSection from '../components/sections/hero';
import Range from '../components/ui/range/range';
import Resources from '../components/sections/resources';
import Spreadsheet from '../components/sections/spreadsheet';

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <Range />
      <Resources />
      <Spreadsheet />
    </main>
  );
}
