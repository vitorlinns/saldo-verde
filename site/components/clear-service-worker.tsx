'use client';

import { useEffect } from 'react';

export default function ClearServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        })
        .catch(() => {
          // ignore failures, this is best-effort cleanup
        });
    }
  }, []);

  return null;
}
