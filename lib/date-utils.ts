import moment from 'jalali-moment';

/**
 * Initialize moment.js with proper locale settings for the application
 * This sets up Persian (Jalali) and Arabic (Gregorian) calendar support
 */
export function initializeMoment() {
  // Set default locale to Persian
  moment.locale('fa');
}

/**
 * Switch moment locale based on application language
 * @param language - The current application language
 */
export function switchMomentLocale(language: 'fa' | 'ar') {
  if (language === 'fa') {
    moment.locale('fa');
  } else {
    moment.locale('ar');
  }
}

/**
 * Format a date according to the current locale and calendar system
 * @param date - The date to format (ISO string, Date object, or moment object)
 * @param format - The format string (optional)
 * @param locale - Override locale (optional)
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | moment.Moment,
  format?: string,
  locale?: 'fa' | 'ar'
): string {
  if (!date) return '';
  
  // Handle different input types carefully
  let momentDate: moment.Moment;
  
  if (typeof date === 'string' && locale === 'fa') {
    // For Persian locale with ISO string input, we need to be explicit
    // First ensure we're in English locale to parse the Gregorian ISO date correctly
    const originalLocale = moment.locale();
    moment.locale('en');
    momentDate = moment(date);
    moment.locale(originalLocale);
  } else {
    momentDate = moment(date);
  }
  
  if (!momentDate.isValid()) return '';
  
  // Temporarily switch locale if specified
  const originalLocale = moment.locale();
  if (locale) {
    switchMomentLocale(locale);
  }
  
  let formatString = format;
  if (!formatString) {
    // Use appropriate default format based on current locale
    const currentLocale = locale || moment.locale();
    if (currentLocale === 'fa') {
      formatString = 'jYYYY/jMM/jDD';
    } else {
      formatString = 'YYYY/MM/DD';
    }
  }
  
  const formatted = momentDate.format(formatString);
  
  // Restore original locale
  if (locale) {
    moment.locale(originalLocale);
  }
  
  return formatted;
}

/**
 * Parse a date string according to the current locale and calendar system
 * @param dateString - The date string to parse
 * @param format - The format string (optional)
 * @param locale - Override locale (optional)
 * @returns moment object or null if invalid
 */
export function parseDate(
  dateString: string,
  format?: string,
  locale?: 'fa' | 'ar'
): moment.Moment | null {
  if (!dateString) return null;
  
  // Temporarily switch locale if specified
  const originalLocale = moment.locale();
  if (locale) {
    switchMomentLocale(locale);
  }
  
  let formatString = format;
  if (!formatString) {
    // Use appropriate default format based on current locale
    const currentLocale = locale || moment.locale();
    if (currentLocale === 'fa') {
      formatString = 'jYYYY/jMM/jDD';
    } else {
      formatString = 'YYYY/MM/DD';
    }
  }
  
  const parsed = moment(dateString, formatString);
  
  // Restore original locale
  if (locale) {
    moment.locale(originalLocale);
  }
  
  return parsed.isValid() ? parsed : null;
}

/**
 * Get today's date in the appropriate calendar system
 * @param locale - The locale to use (optional)
 * @returns Today's date as a moment object
 */
export function getToday(locale?: 'fa' | 'ar'): moment.Moment {
  const originalLocale = moment.locale();
  if (locale) {
    switchMomentLocale(locale);
  }
  
  const today = moment();
  
  if (locale) {
    moment.locale(originalLocale);
  }
  
  return today;
}

/**
 * Get the month names for the current locale
 * @param locale - The locale to use (optional)
 * @returns Array of month names
 */
export function getMonthNames(locale?: 'fa' | 'ar'): string[] {
  const originalLocale = moment.locale();
  if (locale) {
    switchMomentLocale(locale);
  }
  
  const monthNames: string[] = [];
  const currentLocale = locale || moment.locale();
  
  if (currentLocale === 'fa') {
    // Persian month names
    for (let i = 0; i < 12; i++) {
      monthNames.push(moment().jMonth(i).format('jMMMM'));
    }
  } else {
    // Arabic month names
    for (let i = 0; i < 12; i++) {
      monthNames.push(moment().month(i).format('MMMM'));
    }
  }
  
  if (locale) {
    moment.locale(originalLocale);
  }
  
  return monthNames;
}

/**
 * Get the weekday names for the current locale
 * @param locale - The locale to use (optional)
 * @returns Array of weekday names
 */
export function getWeekdayNames(locale?: 'fa' | 'ar'): string[] {
  const originalLocale = moment.locale();
  if (locale) {
    switchMomentLocale(locale);
  }
  
  const weekdayNames: string[] = [];
  
  // Start from the appropriate first day of week for each locale
  for (let i = 0; i < 7; i++) {
    weekdayNames.push(moment().day(i).format('dd'));
  }
  
  if (locale) {
    moment.locale(originalLocale);
  }
  
  return weekdayNames;
}

// Initialize moment when this module is imported
initializeMoment();
