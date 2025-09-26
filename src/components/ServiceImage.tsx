'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getServiceImagePath } from '@/data/serviceImages';
import { SERVICE_NAME_MAP } from '@/data/services';

interface ServiceImageProps {
  service: string;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

export default function ServiceImage({ 
  service, 
  width = 40, 
  height = 40, 
  className = "object-contain",
  alt 
}: ServiceImageProps) {
  const [imageError, setImageError] = useState(false);
  const serviceName = SERVICE_NAME_MAP[service] || service.toUpperCase();
  const firstLetter = serviceName.charAt(0).toUpperCase();

  if (imageError) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold rounded-lg"
        style={{ width, height }}
      >
        <span style={{ fontSize: Math.min(width, height) * 0.4 }}>
          {firstLetter}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={getServiceImagePath(service)}
      alt={alt || serviceName}
      width={width}
      height={height}
      className={className}
      unoptimized
      onError={() => setImageError(true)}
    />
  );
}
