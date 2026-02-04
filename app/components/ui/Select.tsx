import type { ReactElement } from "react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  label?: string;
  error?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  disabled = false,
  label,
  error,
}: SelectProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return (): void => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string): void => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-surface-700 mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          "w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg text-left transition-all",
          error
            ? "border-danger focus:ring-2 focus:ring-danger/20"
            : "border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          disabled
            ? "bg-surface-50 text-surface-400 cursor-not-allowed"
            : "hover:border-surface-400"
        )}
      >
        <span className={selectedOption ? "text-surface-900" : "text-surface-500"}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={clsx(
            "w-5 h-5 text-surface-400 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {error && <p className="mt-1 text-sm text-danger">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-surface-200 rounded-lg shadow-strong animate-scale-in overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-surface-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-surface-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={clsx(
                    "w-full text-left px-4 py-2.5 text-sm transition-colors",
                    option.value === value
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-surface-900 hover:bg-surface-50",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.value === value && (
                      <svg
                        className="w-5 h-5 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
