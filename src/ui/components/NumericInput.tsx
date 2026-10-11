import React from 'react';

interface NumericInputProps {
  label: string;
  value?: number;
  onChange: (val: number | undefined) => void;
  unit?: string;
  placeholder?: string;
  helperText?: string;
  quickPreset?: number[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  unit = 'mm',
  placeholder = '0',
  helperText,
  quickPreset,
  min = 0,
  max,
  step = 1,
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (raw === '') {
      onChange(undefined);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-700 tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {quickPreset && quickPreset.length > 0 && (
          <div className="flex items-center gap-1">
            {quickPreset.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 active:bg-stone-300 transition-colors"
              >
                {preset}{unit}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          type="number"
          inputMode="decimal"
          pattern="[0-9]*"
          min={min}
          max={max}
          step={step}
          value={value !== undefined ? value : ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full text-base font-semibold text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl px-3.5 py-2.5 pr-12 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
        />
        {unit && (
          <span className="absolute right-3.5 text-xs font-bold text-stone-400 pointer-events-none select-none">
            {unit}
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-stone-500 leading-tight">
          {helperText}
        </p>
      )}
    </div>
  );
};
