'use client';

import React, { forwardRef, useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Phone Input Component with +-- --- --- ---- mask
 * Automatically formats phone numbers as users type
 */
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = '', onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatPhoneNumber(value));

    // Format phone number to +-- --- --- ---- pattern
    function formatPhoneNumber(input: string): string {
      // Remove all non-digit characters except the leading +
      const cleaned = input.replace(/[^\d+]/g, '');
      
      // Ensure it starts with +
      let digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
      
      // Limit to 14 digits max (including country code)
      digits = digits.slice(0, 14);
      
      if (digits.length === 0) return '';
      if (digits.length <= 2) return `+${digits}`;
      if (digits.length <= 5) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
      if (digits.length <= 8) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
      
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }

    // Extract raw phone number (digits only with + prefix)
    function getRawPhoneNumber(formatted: string): string {
      const cleaned = formatted.replace(/[^\d+]/g, '');
      return cleaned.startsWith('+') ? cleaned : cleaned ? `+${cleaned}` : '';
    }

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // If user is deleting and we're at a space, jump back to delete the digit
      if (inputValue.length < displayValue.length && inputValue.endsWith(' ')) {
        const newValue = inputValue.slice(0, -1);
        const formatted = formatPhoneNumber(newValue);
        setDisplayValue(formatted);
        onChange?.(getRawPhoneNumber(formatted));
        return;
      }

      const formatted = formatPhoneNumber(inputValue);
      setDisplayValue(formatted);
      onChange?.(getRawPhoneNumber(formatted));
    }, [displayValue, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace on spaces - delete the previous digit instead
      if (e.key === 'Backspace' && e.currentTarget.selectionStart) {
        const cursorPosition = e.currentTarget.selectionStart;
        const charAtCursor = displayValue[cursorPosition - 1];
        
        if (charAtCursor === ' ') {
          e.preventDefault();
          const newValue = displayValue.slice(0, cursorPosition - 2) + displayValue.slice(cursorPosition);
          const formatted = formatPhoneNumber(newValue);
          setDisplayValue(formatted);
          onChange?.(getRawPhoneNumber(formatted));
          
          // Set cursor position after the change
          setTimeout(() => {
            if (e.currentTarget) {
              e.currentTarget.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
            }
          }, 0);
        }
      }
    }, [displayValue, onChange]);

    // Update display value when external value changes
    React.useEffect(() => {
      const formatted = formatPhoneNumber(value);
      setDisplayValue(formatted);
    }, [value]);

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="+-- --- --- ----"
        className={cn(className)}
        maxLength={17} // +XX XXX XXX XXXX = 17 characters max
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
