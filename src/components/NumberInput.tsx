/**
 * @fileoverview
 * Custom Number Input component
 *
 * Provides a clean, modern number input that replaces native browser spin buttons
 * with custom, styleable chevron buttons.
 *
 * @packageDocumentation
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

export interface NumberInputProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'onChange'> {
  value?: number;
  onValueChange?: (value: number) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value = 0, onValueChange, min, max, step = 1, ...props }, ref) => {
    const handleIncrement = () => {
      const next = Number(value) + Number(step);
      if (max !== undefined && next > Number(max)) return;
      onValueChange?.(next);
    };

    const handleDecrement = () => {
      const next = Number(value) - Number(step);
      if (min !== undefined && next < Number(min)) return;
      onValueChange?.(next);
    };

    return (
      <div
        className={[
          'relative flex items-center overflow-hidden rounded-md border border-neutral-700 bg-neutral-800 transition-colors focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          ref={ref}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const val = e.target.value ? Number.parseFloat(e.target.value) : 0;
            onValueChange?.(val);
          }}
          className="w-full bg-transparent pl-2 pr-7 py-2 text-sm text-center font-medium text-neutral-100 placeholder:text-neutral-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...props}
        />
        <div className="absolute right-0 flex h-full flex-col border-l border-neutral-700 bg-neutral-800">
          <button
            type="button"
            tabIndex={-1}
            onClick={handleIncrement}
            className="flex h-1/2 w-6 items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 transition-colors disabled:opacity-50"
            disabled={max !== undefined && Number(value) >= Number(max)}
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={handleDecrement}
            className="flex h-1/2 w-6 border-t border-neutral-700 items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 transition-colors disabled:opacity-50"
            disabled={min !== undefined && Number(value) <= Number(min)}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';
