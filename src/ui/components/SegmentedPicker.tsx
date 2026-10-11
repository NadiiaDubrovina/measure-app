import React from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface SegmentedPickerProps<T extends string> {
  label?: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  required?: boolean;
}

export function SegmentedPicker<T extends string>({
  label,
  options,
  value,
  onChange,
  required = false
}: SegmentedPickerProps<T>) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-stone-700 tracking-wide block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="grid grid-flow-col auto-cols-fr gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
        {options.map(opt => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900 active:bg-stone-200/60'
              }`}
            >
              {opt.icon && <div className="mb-1 text-current">{opt.icon}</div>}
              <span>{opt.label}</span>
              {opt.sublabel && (
                <span className="text-[10px] font-normal opacity-70 mt-0.5">
                  {opt.sublabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
