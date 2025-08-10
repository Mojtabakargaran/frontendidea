'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarPopup } from '@/components/ui/calendar-popup';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDate, parseDate, switchMomentLocale } from '@/lib/date-utils';
import moment from 'jalali-moment';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
}

/**
 * Internationalized Date Picker Component
 * Supports Persian and Arabic (UAE) calendars with proper i18n
 * Features:
 * - Calendar-only selection (no manual input allowed)
 * - Calendar icon on the right side for proper UX
 * - Persian/Shamsi calendar support with custom popup
 * - Arabic/Gregorian calendar support
 * - Proper date formatting based on locale
 * - Keyboard accessibility (Enter/Space to open calendar)
 * - Click outside to close
 */
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(({
  value = '',
  onChange,
  placeholder,
  className,
  disabled = false,
  id,
  name,
  required = false,
  ...props
}, ref) => {
  const { t, i18n } = useTranslation();
  const { config, isLoading } = useGlobalLocaleFormatting();
  const [displayValue, setDisplayValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if we're in RTL mode
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const isPersian = i18n.language === 'fa';

  // Get calendar type based on language first, then fallback to config
  const calendarType = isPersian ? 'persian' : 'gregorian';
  const dateFormat = isPersian ? 'jYYYY/jMM/jDD' : 'YYYY/MM/DD';

  // Helper to get the appropriate portal container
  const getPortalContainer = useCallback(() => {
    // First, try to find if we're inside a Radix dialog
    const dialogPortal = document.querySelector('[data-radix-portal]');
    if (dialogPortal) {
      return dialogPortal as HTMLElement;
    }
    
    // Fallback to document.body
    return document.body;
  }, []);

  // Helper to calculate popup position
  const calculatePopupPosition = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Calculate available space and adjust position if needed
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = 400; // Estimated popup height
    const popupWidth = 280;
    
    let top = rect.bottom + scrollTop + 4; // 4px gap
    let left = rect.left + scrollLeft;
    
    // Check if popup would go below viewport
    if (rect.bottom + popupHeight > viewportHeight) {
      // Position above the input instead
      top = rect.top + scrollTop - popupHeight - 4;
    }
    
    // Check if popup would go beyond right edge (for LTR) or left edge (for RTL)
    if (isRTL) {
      left = rect.right + scrollLeft - popupWidth;
      if (left < 0) {
        left = 8; // Minimum left margin
      }
    } else {
      if (left + popupWidth > viewportWidth) {
        left = viewportWidth - popupWidth - 8; // 8px margin from edge
      }
      if (left < 0) {
        left = 8; // Minimum left margin
      }
    }
    
    setPopupPosition({
      top,
      left,
      width: rect.width
    });
  }, [isRTL]);

  // Position recalculation on scroll and resize
  useEffect(() => {
    const handlePositionUpdate = () => {
      if (isOpen) {
        calculatePopupPosition();
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handlePositionUpdate, true);
      window.addEventListener('resize', handlePositionUpdate);
      
      return () => {
        window.removeEventListener('scroll', handlePositionUpdate, true);
        window.removeEventListener('resize', handlePositionUpdate);
      };
    }
  }, [isOpen, calculatePopupPosition]);

  // Convert between display format and ISO format
  const formatDateForDisplay = useCallback((isoDate: string): string => {
    if (!isoDate) return '';
    
    try {
      // Use the utility function from date-utils
      return formatDate(isoDate, dateFormat, i18n.language as 'fa' | 'ar');
    } catch (error) {
      // Silent error handling - return original date if formatting fails
      return isoDate;
    }
  }, [dateFormat, i18n.language]);

  const parseDateFromDisplay = (displayDate: string): string => {
    if (!displayDate) return '';
    
    try {
      const parsed = parseDate(displayDate, dateFormat, i18n.language as 'fa' | 'ar');
      return parsed ? parsed.format('YYYY-MM-DD') : '';
    } catch (error) {
      // Silent error handling - return empty string if parsing fails
      return '';
    }
  };

  // Update display value when external value changes
  useEffect(() => {
    // Switch moment locale for proper formatting
    switchMomentLocale(i18n.language as 'fa' | 'ar');
    const formatted = formatDateForDisplay(value);
    setDisplayValue(formatted);
  }, [value, calendarType, dateFormat, i18n.language, formatDateForDisplay]);

  // Helper to call onChange with correct format
  const callOnChange = (isoDate: string) => {
    onChange?.(isoDate);
  };

  // No-op function for input changes since we only allow calendar selection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any manual input changes
    e.preventDefault();
  };

  const handleCalendarClick = () => {
    if (disabled) return;
    if (!isOpen) {
      calculatePopupPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleDateSelect = (isoDate: string) => {
    // Update the display value immediately
    const formatted = formatDateForDisplay(isoDate);
    setDisplayValue(formatted);
    
    // Call the onChange callback
    callOnChange(isoDate);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Close calendar on Escape
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    // Open calendar on Enter or Space when focused
    if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
      e.preventDefault();
      calculatePopupPosition();
      setIsOpen(true);
      return;
    }

    // Allow Tab for navigation
    if (e.key === 'Tab') {
      return;
    }

    // Prevent all other key inputs since we only allow calendar selection
    e.preventDefault();
  };

  // Generate appropriate placeholder
  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;
    
    if (isLoading) return t('common.loading');
    
    return t('datePicker.clickToSelect');
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          id={id}
          name={name}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={handleCalendarClick}
          placeholder={getPlaceholder()}
          disabled={disabled}
          required={required}
          readOnly={true}
          className={cn(
            'pr-10 cursor-pointer', // Space for the calendar icon on the right + cursor pointer for better UX
            isRTL && 'text-right',
            className
          )}
          dir={isRTL ? 'rtl' : 'ltr'}
          autoComplete="off"
        />
        
        {/* Calendar Icon - positioned on the right side */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCalendarClick}
          disabled={disabled}
          className={cn(
            'absolute top-0 h-full px-3 py-0',
            'right-0', // Always on the right for proper UX
            'hover:bg-transparent',
            isOpen && 'bg-gray-100'
          )}
          tabIndex={-1}
          aria-label={t('common.openCalendar')}
        >
          <Calendar className="h-4 w-4 text-gray-500" />
        </Button>
      </div>

      {/* Calendar Popup - rendered in portal to avoid z-index issues */}
      {isOpen && !disabled && typeof window !== 'undefined' && 
        createPortal(
          <>
            {/* Backdrop for click outside */}
            <div
              className="fixed inset-0"
              style={{ zIndex: 999998 }}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                  setIsOpen(false);
                }
              }}
            />
            {/* Calendar popup */}
            <CalendarPopup
              selectedDate={value}
              onDateSelect={handleDateSelect}
              calendarType={calendarType}
              onClose={() => setIsOpen(false)}
              className="fixed shadow-xl"
              style={{
                top: `${popupPosition.top}px`,
                left: `${popupPosition.left}px`,
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 999999
              }}
            />
          </>,
          getPortalContainer()
        )
      }
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
