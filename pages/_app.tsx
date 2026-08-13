import type { AppProps } from 'next/app';
import '../app/globals.css';
import SmoothScroll from '../components/ui/scroll/scroll';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SmoothScroll>
      <Component {...pageProps} />
    </SmoothScroll>
  );
}
