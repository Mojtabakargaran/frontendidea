'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { switchMomentLocale, getMonthNames, getWeekdayNames } from '@/lib/date-utils';
import moment from 'jalali-moment';

interface CalendarPopupProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  calendarType: 'persian' | 'gregorian';
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Calendar Popup Component
 * Supports both Persian (Jalali) and Gregorian calendars
 */
export function CalendarPopup({
  selectedDate,
  onDateSelect,
  calendarType,
  onClose,
  className,
  style
}: CalendarPopupProps) {
  const { t, i18n } = useTranslation();
  const { config } = useGlobalLocaleFormatting();
  
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const isPersian = calendarType === 'persian';
  
  // Initialize with selected date or current date
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate && calendarType === 'persian') {
      // For Persian calendar, parse the Gregorian ISO date first, then convert to Persian view
      const originalLocale = moment.locale();
      // Parse as Gregorian first
      moment.locale('en');
      const gregorianDate = moment(selectedDate);
      // Switch to Persian and create view date
      moment.locale('fa');
      const persianDate = gregorianDate.clone();
      moment.locale(originalLocale);
      return persianDate;
    } else if (selectedDate) {
      return moment(selectedDate);
    }
    return moment();
  });

  // Initialize moment locale
  useEffect(() => {
    switchMomentLocale(i18n.language as 'fa' | 'ar');
  }, [i18n.language]);

  // Reset viewDate when calendar type or selectedDate changes to ensure proper display
  useEffect(() => {
    if (selectedDate) {
      if (isPersian) {
        // For Persian calendar, parse the Gregorian ISO date first, then convert to Persian view
        const originalLocale = moment.locale();
        // Parse as Gregorian first
        moment.locale('en');
        const gregorianDate = moment(selectedDate);
        // Switch to Persian and create view date
        moment.locale('fa');
        const persianViewDate = gregorianDate.clone();
        setViewDate(persianViewDate);
        moment.locale(originalLocale);
      } else {
        const gregorianViewDate = moment(selectedDate);
        setViewDate(gregorianViewDate);
      }
    } else {
      // If no selected date, show current month
      if (isPersian) {
        const originalLocale = moment.locale();
        moment.locale('fa');
        setViewDate(moment());
        moment.locale(originalLocale);
      } else {
        setViewDate(moment());
      }
    }
  }, [calendarType, selectedDate, isPersian]);

  // Get month and year for display
  const getDisplayMonth = () => {
    if (isPersian) {
      // Use translation keys for Persian months
      const monthNames = t('datePicker.months.persian', { returnObjects: true }) as string[];
      const monthIndex = viewDate.jMonth(); // 0-based index for Jalali months
      return monthNames[monthIndex] || viewDate.format('jMMMM');
    } else {
      // Use translation keys for Gregorian months
      const monthNames = t('datePicker.months.gregorian', { returnObjects: true }) as string[];
      const monthIndex = viewDate.month(); // 0-based index for Gregorian months
      return monthNames[monthIndex] || viewDate.format('MMMM');
    }
  };

  const getDisplayYear = () => {
    if (isPersian) {
      return viewDate.format('jYYYY');
    }
    return viewDate.format('YYYY');
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    if (isPersian) {
      setViewDate(viewDate.clone().subtract(1, 'jMonth'));
    } else {
      setViewDate(viewDate.clone().subtract(1, 'month'));
    }
  };

  const goToNextMonth = () => {
    if (isPersian) {
      setViewDate(viewDate.clone().add(1, 'jMonth'));
    } else {
      setViewDate(viewDate.clone().add(1, 'month'));
    }
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const days: moment.Moment[] = [];
    
    let startOfMonth: moment.Moment;
    let endOfMonth: moment.Moment;
    let startOfWeek: moment.Moment;
    
    if (isPersian) {
      startOfMonth = viewDate.clone().startOf('jMonth');
      endOfMonth = viewDate.clone().endOf('jMonth');
      
      // For Persian calendar, week starts on Saturday
      const firstDayOfMonth = startOfMonth.clone();
      const dayOfWeek = firstDayOfMonth.day(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      
      // Calculate days to go back to reach the previous/current Saturday
      const daysToGoBack = (dayOfWeek + 1) % 7; // This will give us: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
      
      startOfWeek = firstDayOfMonth.clone().subtract(daysToGoBack, 'days');
    } else {
      startOfMonth = viewDate.clone().startOf('month');
      endOfMonth = viewDate.clone().endOf('month');
      startOfWeek = startOfMonth.clone().startOf('week');
    }

    // Fill previous month days
    const startDate = startOfWeek.clone();
    while (startDate.isBefore(startOfMonth)) {
      days.push(startDate.clone());
      startDate.add(1, 'day');
    }

    // Fill current month days
    const currentDate = startOfMonth.clone();
    while (currentDate.isSameOrBefore(endOfMonth)) {
      days.push(currentDate.clone());
      currentDate.add(1, 'day');
    }

    // Fill next month days to complete 6 weeks (42 days)
    while (days.length < 42) {
      days.push(currentDate.clone());
      currentDate.add(1, 'day');
    }

    return days;
  };

  // Get weekday headers
  const getWeekdayHeaders = () => {
    if (isPersian) {
      const weekdays = t('datePicker.weekdays.persian', { returnObjects: true }) as string[];
      return weekdays.length === 7 ? weekdays : ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    } else {
      const weekdays = t('datePicker.weekdays.gregorian', { returnObjects: true }) as string[];
      return weekdays.length === 7 ? weekdays : ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
    }
  };

  const handleDateClick = (date: moment.Moment) => {
    // Always ensure we send Gregorian ISO date to backend
    let isoDate: string;
    
    if (isPersian) {
      // For Persian calendar, we need to be extra careful about conversion
      // Use Unix timestamp as the universal conversion method
      const timestamp = date.valueOf(); // Get Unix timestamp
      const gregorianMoment = moment(timestamp).locale('en'); // Create new Gregorian moment from timestamp
      isoDate = gregorianMoment.format('YYYY-MM-DD');
    } else {
      // For Gregorian calendar, format normally
      isoDate = date.format('YYYY-MM-DD');
    }
    
    onDateSelect(isoDate);
    onClose();
  };

  const isDateSelected = (date: moment.Moment) => {
    if (!selectedDate) return false;
    
    // Convert date to Gregorian format for comparison
    let dateISO: string;
    if (isPersian) {
      // Use same conversion logic as handleDateClick
      const timestamp = date.valueOf();
      const gregorianMoment = moment(timestamp).locale('en');
      dateISO = gregorianMoment.format('YYYY-MM-DD');
    } else {
      dateISO = date.format('YYYY-MM-DD');
    }
    
    return dateISO === selectedDate;
  };

  const isDateInCurrentMonth = (date: moment.Moment) => {
    if (isPersian) {
      return date.jMonth() === viewDate.jMonth() && date.jYear() === viewDate.jYear();
    } else {
      return date.month() === viewDate.month() && date.year() === viewDate.year();
    }
  };

  const isToday = (date: moment.Moment) => {
    return date.isSame(moment(), 'day');
  };

  const calendarDays = generateCalendarDays();
  const weekdayHeaders = getWeekdayHeaders();

  return (
    <div 
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px]',
        'transform transition-all duration-200 pointer-events-auto',
        className
      )}
      style={{
        ...style,
        position: style?.position || 'absolute'
      }}
    >
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={isRTL ? goToNextMonth : goToPreviousMonth}
          className="p-1 h-8 w-8"
        >
          {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {getDisplayMonth()} {getDisplayYear()}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={isRTL ? goToPreviousMonth : goToNextMonth}
          className="p-1 h-8 w-8"
        >
          {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayHeaders.map((day, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const isSelected = isDateSelected(date);
          const isCurrentMonth = isDateInCurrentMonth(date);
          const isTodayDate = isToday(date);
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleDateClick(date)}
              className={cn(
                'h-8 w-8 p-0 text-sm hover:bg-blue-50',
                isSelected && 'bg-blue-600 text-white hover:bg-blue-700',
                !isCurrentMonth && 'text-gray-300',
                isTodayDate && !isSelected && 'bg-blue-100 text-blue-900',
                'transition-colors duration-150'
              )}
            >
              {isPersian ? date.format('jD') : date.format('D')}
            </Button>
          );
        })}
      </div>

      {/* Today button */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDateClick(moment())}
          className="w-full text-sm"
        >
          {t('datePicker.today')}
        </Button>
      </div>
    </div>
  );
}

export default CalendarPopup;
