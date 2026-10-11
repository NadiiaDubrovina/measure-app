import React from 'react';

interface TouchCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  highlighted?: boolean;
}

export const TouchCard: React.FC<TouchCardProps> = ({
  children,
  className = '',
  onClick,
  highlighted = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border p-4 shadow-xs transition-all ${
        highlighted
          ? 'border-emerald-500/50 ring-2 ring-emerald-500/10'
          : 'border-stone-200 hover:border-stone-300'
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
