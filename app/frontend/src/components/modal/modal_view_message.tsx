import { useState } from 'react';
import { Check } from 'lucide-react';
import ButtonSubmit from '../btn/button_submit';

interface ModalViewMessageProps {
  open: boolean;
  title: string;
  message: string;
  date: string;
  time?: string;
  notificationId?: string;
  accessToken?: string;
  onClose: () => void;
  onMarked?: () => void;
}

const BACKEND_URL = '/api';

export default function ModalViewMessage({
  open,
  message,
  date,
  time,
  notificationId,
  accessToken,
  onClose,
  onMarked,
}: ModalViewMessageProps) {
  const [marking, setMarking] = useState(false);

  const handleMarkAsRead = async () => {
    if (!notificationId || !accessToken) {
      onClose();
      onMarked?.();
      return;
    }

    setMarking(true);
    try {
      const response = await fetch(`${BACKEND_URL}/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onMarked?.();
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    } finally {
      setMarking(false);
      onClose();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-[0.5rem] border border-border bg-surface p-6 text-white">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-white/60">
                <span className="font-regular text-white">Data</span>
                <span className="mx-2">•</span>
                <span>{date}</span>
                <span className="mx-2">•</span>
                <span>{time ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[0.5rem] border border-border bg-surface p-5 text-lg leading-8 text-white/80">
            {message}
          </div>

          <div className="flex justify-end">
            <ButtonSubmit
              type="button"
              label={marking ? 'Marcando...' : 'Marcar como lido'}
              icon={<Check className="h-4 w-4" />}
              onClick={handleMarkAsRead}
              loading={marking}
              fullWidth={false}
              className="h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
