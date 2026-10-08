import type { UseFormRegisterReturn } from "react-hook-form"
import { cn } from "cn"

// A labelled native <select> with its validation message; wired the same way
// as FormField (aria-describedby + a live region for the message).
//
// It matches the text fields: 44px tall on the white field colour with the
// control radius, and 16px text below `lg` (iOS zooms in on any field whose
// text is smaller).
function FormSelectField({
  id,
  label,
  options,
  placeholder,
  error,
  required,
  registration,
}: {
  id: string
  label: string
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string
  /** A choice must be made; announced to screen readers. */
  required?: boolean
  registration: UseFormRegisterReturn
}) {
  const errorId = `${id}-error`
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-charcoal">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        aria-required={required || undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-11 w-full rounded-(--radius-control) border border-input bg-card px-3 text-sm text-charcoal transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 max-lg:text-base"
        )}
        {...registration}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}

export { FormSelectField }
