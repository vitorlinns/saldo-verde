import type { CSSProperties } from 'react';

interface PreloaderProps {
  visible?: boolean;
}

const spinnerStyle: CSSProperties = {
  borderTopColor: 'rgba(255, 255, 255, 0.7)',
};

export default function Preloader({ visible = false }: PreloaderProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-black/90 px-8 py-6 shadow-xl shadow-black/40">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-white/10"
          style={spinnerStyle}
        />
        <div className="text-center text-sm text-white/80">
          Carregando página...
        </div>
      </div>
    </div>
  );
}