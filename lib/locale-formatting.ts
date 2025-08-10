'use client';

import moment from 'jalali-moment';
import { LocaleFormattingResponse, TenantLocale, TenantLanguage } from '@/types';

// Persian digits for display
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

// Convert Latin digits to Persian digits
const convertToPersianDigits = (str: string): string => {
  return str.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};

// Convert Latin digits to Arabic digits
const convertToArabicDigits = (str: string): string => {
  return str.replace(/[0-9]/g, (digit) => arabicDigits[parseInt(digit)]);
};

/**
 * Format date according to locale configuration
 */
export const formatDate = (
  dateString: string,
  config: LocaleFormattingResponse['data']
): string => {
  try {
    const date = new Date(dateString);
    
    if (config.locale === 'iran' && config.dateFormat.calendar === 'persian') {
      // Use jalali-moment for proper Persian calendar conversion
      const jMoment = moment(date).locale('fa');
      const formattedDate = jMoment.format('D MMMM YYYY');
      return convertToPersianDigits(formattedDate);
    } else {
      // UAE locale - use Gregorian calendar
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      const locale = config.locale === 'uae' ? 'ar-AE' : 'fa-IR';
      const formattedDate = date.toLocaleDateString(locale, options);
      
      if (config.numberFormat.digits === 'arabic') {
        return convertToArabicDigits(formattedDate);
      } else if (config.numberFormat.digits === 'persian') {
        return convertToPersianDigits(formattedDate);
      }
      
      return formattedDate;
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    // Fallback to a simpler format
    try {
      const date = new Date(dateString);
      const fallbackFormat = date.toLocaleDateString();
      if (config.numberFormat.digits === 'persian') {
        return convertToPersianDigits(fallbackFormat);
      } else if (config.numberFormat.digits === 'arabic') {
        return convertToArabicDigits(fallbackFormat);
      }
      return fallbackFormat;
    } catch (fallbackError) {
      return dateString;
    }
  }
};

/**
 * Format number according to locale configuration
 */
export const formatNumber = (
  number: number,
  config: LocaleFormattingResponse['data']
): string => {
  try {
    const { decimal, thousands, digits } = config.numberFormat;
    
    // Format with appropriate separators
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    
    let formatted = parts.join(decimal);
    
    // Convert digits based on locale
    if (digits === 'persian') {
      formatted = convertToPersianDigits(formatted);
    } else if (digits === 'arabic') {
      formatted = convertToArabicDigits(formatted);
    }
    
    return formatted;
  } catch (error) {
    console.error('Number formatting error:', error);
    return number.toString();
  }
};

/**
 * Format currency according to locale configuration
 */
export const formatCurrency = (
  amount: number,
  config: LocaleFormattingResponse['data']
): string => {
  try {
    const { code, symbol, position } = config.currencyFormat;
    const formattedNumber = formatNumber(amount, config);
    
    if (position === 'before') {
      return `${symbol} ${formattedNumber}`;
    } else {
      return `${formattedNumber} ${symbol}`;
    }
  } catch (error) {
    console.error('Currency formatting error:', error);
    return amount.toString();
  }
};

/**
 * Get short date format based on locale
 */
export const getShortDateFormat = (
  dateString: string,
  config: LocaleFormattingResponse['data']
): string => {
  try {
    const date = new Date(dateString);
    
    if (config.locale === 'iran' && config.dateFormat.calendar === 'persian') {
      // Use jalali-moment for proper Persian calendar conversion
      const jMoment = moment(date).locale('fa');
      const formatted = jMoment.format('YYYY/MM/DD');
      return convertToPersianDigits(formatted);
    } else {
      // UAE locale - use Gregorian calendar
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      
      const locale = config.locale === 'uae' ? 'ar-AE' : 'fa-IR';
      const formatted = date.toLocaleDateString(locale, options);
      
      if (config.numberFormat.digits === 'arabic') {
        return convertToArabicDigits(formatted);
      } else if (config.numberFormat.digits === 'persian') {
        return convertToPersianDigits(formatted);
      }
      
      return formatted;
    }
  } catch (error) {
    console.error('Short date formatting error:', error);
    // Fallback to a simpler format
    try {
      const date = new Date(dateString);
      const fallbackFormat = date.toLocaleDateString();
      if (config.numberFormat.digits === 'persian') {
        return convertToPersianDigits(fallbackFormat);
      } else if (config.numberFormat.digits === 'arabic') {
        return convertToArabicDigits(fallbackFormat);
      }
      return fallbackFormat;
    } catch (fallbackError) {
      return dateString;
    }
  }
};

/**
 * Format date and time according to locale configuration
 */
export const formatDateTime = (
  dateString: string,
  config: LocaleFormattingResponse['data']
): string => {
  try {
    const date = new Date(dateString);
    
    if (config.locale === 'iran' && config.dateFormat.calendar === 'persian') {
      // Use jalali-moment for proper Persian calendar conversion
      const jMoment = moment(date).locale('fa');
      const formatted = jMoment.format('D MMMM YYYY HH:mm');
      return convertToPersianDigits(formatted);
    } else {
      // UAE locale - use Gregorian calendar
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      const locale = config.locale === 'uae' ? 'ar-AE' : 'fa-IR';
      const formatted = date.toLocaleDateString(locale, options);
      
      if (config.numberFormat.digits === 'arabic') {
        return convertToArabicDigits(formatted);
      } else if (config.numberFormat.digits === 'persian') {
        return convertToPersianDigits(formatted);
      }
      
      return formatted;
    }
  } catch (error) {
    console.error('DateTime formatting error:', error);
    // Fallback to a simpler format
    try {
      const date = new Date(dateString);
      const fallbackFormat = date.toLocaleString();
      if (config.numberFormat.digits === 'persian') {
        return convertToPersianDigits(fallbackFormat);
      } else if (config.numberFormat.digits === 'arabic') {
        return convertToArabicDigits(fallbackFormat);
      }
      return fallbackFormat;
    } catch (fallbackError) {
      return dateString;
    }
  }
};

/**
 * Default locale configuration for fallback
 */
export const defaultLocaleConfig: LocaleFormattingResponse['data'] = {
  locale: 'iran',
  language: 'persian',
  dateFormat: {
    calendar: 'persian',
    format: 'YYYY/MM/DD',
    example: '۱۴۰۳/۰۱/۱۵'
  },
  numberFormat: {
    digits: 'persian',
    decimal: '/',
    thousands: '،',
    example: '۱۲۳،۴۵۶/۷۸'
  },
  currencyFormat: {
    code: 'IRR',
    symbol: 'ریال',
    position: 'after',
    example: '۱۲۳،۴۵۶ ریال'
  }
};
