import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  error,
  helperText,
  leftIcon,
  rightElement,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-[#9A9DA6] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9A9DA6]">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={`block w-full border text-sm transition-colors placeholder:text-[#9A9DA6]/50 focus:outline-none ${
            leftIcon ? 'pl-9' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 ${
            error
              ? 'border-rose-500/50 text-rose-200 bg-rose-950/20 focus:border-rose-500'
              : 'border-[rgba(242,241,237,0.08)] text-[#F2F1ED] bg-[#16181D] hover:border-[rgba(242,241,237,0.18)] focus:border-[#4C63D2]'
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">{rightElement}</div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#9A9DA6]">{helperText}</p>
      ) : null}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  error,
  helperText,
  className = '',
  rows = 3,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-[#9A9DA6] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`block w-full border text-sm transition-colors placeholder:text-[#9A9DA6]/50 focus:outline-none px-3.5 py-2.5 ${
          error
            ? 'border-rose-500/50 text-rose-200 bg-rose-950/20 focus:border-rose-500'
            : 'border-[rgba(242,241,237,0.08)] text-[#F2F1ED] bg-[#16181D] hover:border-[rgba(242,241,237,0.18)] focus:border-[#4C63D2]'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#9A9DA6]">{helperText}</p>
      ) : null}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  error,
  helperText,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-[#9A9DA6] mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`block w-full border text-sm transition-colors focus:outline-none px-3.5 py-2.5 bg-[#16181D] ${
          error
            ? 'border-rose-500/50 text-rose-200 focus:border-rose-500'
            : 'border-[rgba(242,241,237,0.08)] text-[#F2F1ED] hover:border-[rgba(242,241,237,0.18)] focus:border-[#4C63D2]'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#16181D] text-[#F2F1ED]">
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-rose-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#9A9DA6]">{helperText}</p>
      ) : null}
    </div>
  );
};
