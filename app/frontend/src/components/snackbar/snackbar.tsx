import { useEffect, useRef, useState } from 'react';
import CheckLineIcon from 'remixicon-react/CheckLineIcon';
import ErrorWarningFillIcon from 'remixicon-react/ErrorWarningFillIcon';

interface SnackbarProps {
  open: boolean;
  message?: string | null;
  type?: 'success' | 'error';
  duration?: number;
  onClose?: () => void;
}

const EXIT_ANIMATION_DURATION = 240;

export default function Snackbar({
  open,
  message,
  type = 'success',
  duration = 4000,
  onClose,
}: SnackbarProps) {
  const [render, setRender] = useState(open && !!message);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<{ show?: number; hide?: number; close?: number }>({});

  useEffect(() => {
    const clearTimers = () => {
      if (timerRef.current.show) window.clearTimeout(timerRef.current.show);
      if (timerRef.current.hide) window.clearTimeout(timerRef.current.hide);
      if (timerRef.current.close) window.clearTimeout(timerRef.current.close);
      timerRef.current.show = undefined;
      timerRef.current.hide = undefined;
      timerRef.current.close = undefined;
    };

    clearTimers();

    if (open && message) {
      setRender(true);
      setVisible(false);
      timerRef.current.show = window.setTimeout(() => setVisible(true), 10);
      timerRef.current.close = window.setTimeout(() => {
        setVisible(false);
        timerRef.current.hide = window.setTimeout(() => {
          onClose?.();
          setRender(false);
        }, EXIT_ANIMATION_DURATION);
      }, duration);

      return clearTimers;
    }

    if (!open && render) {
      setVisible(false);
      timerRef.current.hide = window.setTimeout(() => setRender(false), EXIT_ANIMATION_DURATION);
      return clearTimers;
    }

    return clearTimers;
  }, [open, message, duration, onClose, render]);

  if (!render) {
    return null;
  }

  const isSuccess = type === 'success';
  const icon = isSuccess ? (
    <CheckLineIcon className="h-4 w-4" />
  ) : (
    <ErrorWarningFillIcon size={18} color="#040404df" className="h-4 w-4" />
  );

  const containerClasses = isSuccess
    ? 'border-success bg-success text-black'
    : 'border-danger bg-danger text-black';

  const animationStyle = {
    transform: visible ? 'translateY(0)' : 'translateY(100%)',
    opacity: visible ? 1 : 0,
    transition: 'transform 300ms ease-out, opacity 300ms ease-out',
  } as const;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-8 z-50 flex justify-center sm:inset-x-auto sm:right-6">
      <div
        role="status"
        aria-live="polite"
        style={animationStyle}
        className={`pointer-events-auto flex max-w-[28rem] items-center gap-3 rounded-xl border px-4 py-3 shadow-xl shadow-black/25 ${containerClasses}`}
      >
        <span className="inline-flex h-8 w-8 min-w-[2rem] items-center justify-center rounded-full bg-black/10">
          {icon}
        </span>

        <span className="text-sm leading-6">{message}</span>
      </div>
    </div>
  );
}
