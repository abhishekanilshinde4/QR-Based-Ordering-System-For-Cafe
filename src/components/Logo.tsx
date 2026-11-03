import React from 'react';
import { QrCode, Utensils } from 'lucide-react';
import { useBrand } from '../context/BrandContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  customName?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true, customName }) => {
  const { brandName } = useBrand();
  const effectiveName = customName || brandName || 'ScanDine';

  const iconBox = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-9 h-9 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base'
  }[size];

  const titleSize = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl sm:text-3xl font-extrabold'
  }[size];

  const subtitleSize = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs'
  }[size];

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 select-none">
      {/* Modern QR + Dine Icon in Royal Blue */}
      <div className={`relative shrink-0 ${iconBox} bg-blue-600 text-white flex items-center justify-center shadow-xs`}>
        <div className="relative">
          <QrCode className="w-5 h-5" />
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-2xs">
            <Utensils className="w-2.5 h-2.5" />
          </div>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-sans tracking-tight text-slate-900 ${titleSize}`}>
            {effectiveName}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
            Smart QR
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-sans tracking-wide text-slate-500 font-medium ${subtitleSize} mt-0.5`}>
            Hotel Table Ordering System
          </span>
        )}
      </div>
    </div>
  );
};
