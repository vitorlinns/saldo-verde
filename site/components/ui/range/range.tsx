'use client';

import { useEffect, useRef } from 'react';
import BarChartLineIcon from 'remixicon-react/BarChartLineIcon';
import BriefcaseLineIcon from 'remixicon-react/BriefcaseLineIcon';
import PercentLineIcon from 'remixicon-react/PercentLineIcon';
import ShieldCheckLineIcon from 'remixicon-react/ShieldCheckLineIcon';
import TimerLineIcon from 'remixicon-react/TimerLineIcon';
import WalletLineIcon from 'remixicon-react/WalletLineIcon';

const items = [
  {
    icon: WalletLineIcon,
    label: 'Controle de gastos'
  },
  {
    icon: BarChartLineIcon,
    label: 'Planejamento claro'
  },
  {
    icon: ShieldCheckLineIcon,
    label: 'Segurança financeira'
  },
  {
    icon: TimerLineIcon,
    label: 'Pagamentos rápidos'
  },
  {
    icon: PercentLineIcon,
    label: 'Menos taxas'
  },
  {
    icon: BriefcaseLineIcon,
    label: 'Metas alcançadas'
  }
];

export default function Range() {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const wrapper = track.parentElement;
    if (!wrapper) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || '0');

    while (track.scrollWidth < wrapper.offsetWidth * 2) {
      const cloneIndex = track.children.length % items.length;
      const clone = track.children[cloneIndex].cloneNode(true) as HTMLElement;
      track.appendChild(clone);
      if (track.children.length > items.length * 10) break;
    }

    let previousTimestamp = performance.now();
    const speed = 0.05; // px per ms

    const animate = (timestamp: number) => {
      const delta = timestamp - previousTimestamp;
      previousTimestamp = timestamp;
      offsetRef.current -= delta * speed;

      const firstChild = track.firstElementChild as HTMLElement | null;
      if (firstChild) {
        const firstWidth = firstChild.offsetWidth + gap;
        if (-offsetRef.current >= firstWidth) {
          offsetRef.current += firstWidth;
          track.appendChild(firstChild);
        }
      }

      track.style.transform = `translateX(${offsetRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative overflow-hidden py-10">
      <div className="w-full overflow-hidden bg-primary-300 py-8">
        <div
          ref={trackRef}
          className="track mx-auto flex min-w-full flex-nowrap items-center gap-10 px-6 text-base sm:text-lg font-semibold normal-case text-slate-950"
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={`${item.label}-${index}`} className="flex items-center gap-3 whitespace-nowrap">
                <Icon className="h-6 w-6 text-slate-950" />
                <span>{item.label}</span>
                <span className="separator">{'//'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .track {
          transition: transform 0s linear;
        }

        .separator {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
