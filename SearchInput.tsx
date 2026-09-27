import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  id = 'search-input',
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-[#9A9DA6] pointer-events-none" />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-xs bg-[#16181D] border border-[rgba(242,241,237,0.08)] text-[#F2F1ED] placeholder:text-[#9A9DA6]/50 focus:outline-none focus:border-[#4C63D2] hover:border-[rgba(242,241,237,0.18)] transition-colors"
      />
      {value && (
        <button
          id={`${id}-clear`}
          onClick={() => onChange('')}
          className="absolute right-2.5 text-[#9A9DA6] hover:text-[#F2F1ED] p-0.5"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
