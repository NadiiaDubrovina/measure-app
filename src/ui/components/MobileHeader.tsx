import React from 'react';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  isSaving?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  isSaving = false
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="p-2 -ml-1.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-stone-900 text-base leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSaving ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Saving</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" />
              <span>Local Storage</span>
            </div>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
};
