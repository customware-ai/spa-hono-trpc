import type { InputHTMLAttributes, ReactElement, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps): ReactElement {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const baseStyles =
    'w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';
  const errorStyles = error
    ? 'border-danger focus:ring-danger focus:border-danger'
    : 'border-surface-300';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-surface-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-surface-500">{helperText}</p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: TextareaProps): ReactElement {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const baseStyles =
    'w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[80px] resize-y';
  const errorStyles = error
    ? 'border-danger focus:ring-danger focus:border-danger'
    : 'border-surface-300';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-surface-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-surface-500">{helperText}</p>
      )}
    </div>
  );
}
