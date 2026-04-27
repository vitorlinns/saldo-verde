'use client';

import dynamic from 'next/dynamic';

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });

type DownloadQrProps = {
  value: string;
};

export default function DownloadQr({ value }: DownloadQrProps) {
  return <QRCode value={value} size={180} bgColor="#f8fafc" fgColor="#0f172a" />;
}
