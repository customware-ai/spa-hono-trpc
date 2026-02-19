import * as React from "react"

import { cn } from "~/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  helperText?: string
}

function Input({ className, type, label, error, helperText, id, ...props }: InputProps): React.ReactElement {
  const generatedId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={generatedId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
        >
          {label}
        </label>
      )}
      <input
        id={generatedId}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          error && "border-destructive aria-invalid:ring-destructive/20",
          className
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? (
        <p className="text-[0.8rem] font-medium text-destructive mt-2">{error}</p>
      ) : helperText ? (
        <p className="text-[0.8rem] text-muted-foreground mt-2">{helperText}</p>
      ) : null}
    </div>
  )
}

export { Input }
