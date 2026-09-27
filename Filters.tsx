import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroupProps {
  id?: string;
  label?: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const FilterPills: React.FC<FilterGroupProps> = ({
  id = 'filter-pills',
  label,
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5" id={id}>
      {label && <span className="text-xs text-[#9A9DA6] mr-1 font-mono">{label}:</span>}
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <button
            key={opt.value}
            id={`${id}-${opt.value}`}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1 text-xs transition-colors cursor-pointer border ${
              isSelected
                ? 'bg-[#1C2028] text-[#F2F1ED] border-[#4C63D2]'
                : 'bg-transparent text-[#9A9DA6] border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] hover:text-[#F2F1ED]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
