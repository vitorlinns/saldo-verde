import { Check } from 'lucide-react';
import ButtonSubmit from '../btn/button_submit';

interface ModalViewMessageProps {
  open: boolean;
  title: string;
  message: string;
  date: string;
  time?: string;
  onClose: () => void;
}

export default function ModalViewMessage({
  open,
  message,
  date,
  time,
  onClose,
}: ModalViewMessageProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-black/95 p-6 text-white shadow-xl shadow-black/40">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-white/60">
                <span className="font-semibold text-white">Data</span>
                <span className="mx-2">•</span>
                <span>{date}</span>
                <span className="mx-2">•</span>
                <span>{time ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-black/80 p-5 text-lg leading-8 text-white/80">
            {message}
          </div>

          <div className="flex justify-end">
            <ButtonSubmit
              type="button"
              label="Marcar como lido"
              icon={<Check className="h-4 w-4" />}
              onClick={onClose}
              fullWidth={false}
              className="h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
