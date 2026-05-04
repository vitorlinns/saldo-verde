import { Camera } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface UploadImgProps {
  imageUrl: string;
  onChange: (file: File | null) => void;
  acceptedTypes?: string;
  note?: string;
  disabled?: boolean;
}

export default function UploadImg({
  imageUrl,
  onChange,
  acceptedTypes = 'image/png,image/jpeg',
  note = 'PNG ou JPEG',
  disabled = false,
}: UploadImgProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = event.target.files?.[0] ?? null;
    onChange(file);
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor="upload-profile-image"
        className={`group relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-white transition focus:outline-none focus-visible:ring-0 ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-gray hover:bg-white/10'}`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Prévia da foto" className="h-full w-full object-cover" />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/90">
          <Camera className="h-8 w-8" />
        </div>
      </label>
      <input
        id="upload-profile-image"
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only focus:outline-none"
      />
    </div>
  );
}
