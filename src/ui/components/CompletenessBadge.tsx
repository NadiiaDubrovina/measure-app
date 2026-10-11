import React from 'react';

interface CompletenessBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const CompletenessBadge: React.FC<CompletenessBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true
}) => {
  const getColors = (pct: number) => {
    if (pct >= 90) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-600' };
    if (pct >= 60) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' };
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500' };
  };

  const colors = getColors(score);

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
        <span>{score}%</span>
        {showLabel && <span className="text-[10px] opacity-75">complete</span>}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-2xl border ${colors.bg} ${colors.border}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-stone-700">Measurement Completeness</span>
          <span className={`text-2xl font-black ${colors.text}`}>{score}%</span>
        </div>
        <div className="w-full bg-stone-200/80 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full ${colors.bar} transition-all duration-500 ease-out`}
            style={{ width: `${Math.max(4, score)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
      <span>{score}%</span>
      {showLabel && <span className="text-xs font-medium opacity-85">Complete</span>}
    </div>
  );
};
