import { Building2, User } from 'lucide-react';
import { useState } from 'react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackVariant?: 'hostel' | 'avatar';
}

export function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackVariant = 'hostel',
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 ${className}`}
      >
        {fallbackVariant === 'avatar' ? (
          <User className="w-8 h-8 stroke-[1.5]" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-4 text-center">
            <Building2 className="w-8 h-8 stroke-[1.5]" />
            <span className="text-xs font-medium text-slate-500 line-clamp-1">{alt}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
