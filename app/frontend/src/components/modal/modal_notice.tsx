import { Check, X } from 'lucide-react';
import ButtonSubmit from '../btn/button_submit';

interface ModalNoticeProps {
  open: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  onClose: () => void;
  onAction?: () => void;
}

export default function ModalNotice({
  open,
  title,
  description,
  actionLabel = 'Completar cadastro',
  onClose,
  onAction,
}: ModalNoticeProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-[0.5rem] border border-border bg-surface p-6 text-white">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-regular">{title}</h2>
              <p className="mt-3 text-base leading-7 text-white/80">{description}</p>
            </div>
           
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonSubmit
              type="button"
              label="Fechar"
              icon={<X className="h-4 w-4" />}
              onClick={onClose}
              className="w-full h-10 bg-white/5 text-white hover:bg-white/10"
            />
            {onAction ? (
              <ButtonSubmit
                type="button"
                label={actionLabel}
                icon={<Check className="h-4 w-4" />}
                onClick={onAction}
                className="w-full h-10"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
