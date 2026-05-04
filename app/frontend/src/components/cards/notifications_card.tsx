import { Eye } from 'lucide-react';
import ButtonSubmit from '../btn/button_submit';

interface NotificationCardProps {
  title: string;
  message: string;
  unread?: boolean;
  onView: () => void;
}

export default function NotificationsCard({
  title,
  message,
  unread = false,
  onView,
}: NotificationCardProps) {
  return (
    <div className="rounded-[0.5rem] border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center overflow-hidden">
            <img src="/assets/brand/favicon.png" alt="Saldo Verde" className="h-8 w-8 object-contain" />
          </div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>

        <ButtonSubmit
          type="button"
          label="Ver mensagem"
          icon={<Eye className="h-4 w-4" />}
          onClick={onView}
          fullWidth={false}
          className="h-10"
        />
      </div>
    </div>
  );
}
