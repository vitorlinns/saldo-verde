import type { ReactNode } from 'react';
import { Trash2, X } from 'lucide-react';
import ButtonSubmit from '../btn/button_submit';
import ButtonDanger from '../btn/button_danger';

interface ModalProps {
  open: boolean;
  title: string;
  description: string;
  warning?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmIcon?: ReactNode;
  confirmType?: 'danger' | 'submit';
  hideCancel?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export default function Modal({
  open,
  title,
  description,
  warning,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmIcon,
  confirmType = 'danger',
  hideCancel = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-black/95 p-6 text-white shadow-xl shadow-black/40">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-base text-white/80">{description}</p>
          </div>

          {children ? <div className="rounded-2xl border border-border bg-black/80 p-4 text-base text-white/80">{children}</div> : null}

          {warning ? (
            <div className="rounded-2xl border border-danger bg-danger_bg/10 p-4 text-sm text-danger">
              {warning}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {!hideCancel ? (
            <ButtonSubmit
              type="button"
              label={cancelLabel}
              icon={<X className="h-4 w-4" />}
              onClick={onCancel}
              disabled={loading}
              className="w-full h-10 focus:outline-none focus:ring-0"
            />
          ) : null}
          {confirmType === 'submit' ? (
            <ButtonSubmit
              type="button"
              label={confirmLabel}
              icon={confirmIcon}
              onClick={onConfirm}
              disabled={loading}
              className="w-full h-10"
            />
          ) : (
            <ButtonDanger
              type="button"
              label={confirmLabel}
              icon={confirmIcon ?? <Trash2 className="h-4 w-4" />}
              loading={loading}
              onClick={onConfirm}
              className="w-full h-10"
            />
          )}
        </div>
      </div>
    </div>
  );
}
