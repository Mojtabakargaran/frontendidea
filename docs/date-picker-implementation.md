# Internationalized Date Picker Implementation

## Overview

We have implemented a comprehensive internationalized date picker system that supports both Persian (Shamsi/Jalali) and Arabic (Gregorian) calendars with proper i18n integration.

## Key Features

### 🌍 Full i18n Support
- **Persian (fa)**: Uses Shamsi/Jalali calendar
- **Arabic (ar)**: Uses Gregorian calendar for UAE
- Automatic locale detection and switching
- Proper RTL support for both languages

### 🗓️ Calendar Icon Positioning
- **Fixed Issue**: Calendar icon is now correctly positioned on the right side
- **Better UX**: Consistent positioning regardless of language direction
- **Accessibility**: Proper ARIA labels and keyboard navigation

### 📅 Smart Date Formatting
- Automatic format detection based on locale configuration
- Persian: `jYYYY/jMM/jDD` (Jalali format)
- Arabic: `YYYY/MM/DD` (Gregorian format)
- Configurable via backend locale settings

### ⌨️ Enhanced User Experience
- Interactive calendar popup with month/year navigation
- Keyboard accessibility (Enter, Space, Escape, Arrow keys)
- Click outside to close
- Today button for quick selection
- Input validation and error handling

## Components

### 1. DatePicker Component
**Location**: `components/ui/date-picker.tsx`

```tsx
import { DatePicker } from '@/components/ui/date-picker';

// Basic usage
<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="Select a date"
/>

// With form integration
<DatePicker
  id="birthDate"
  name="birthDate"
  value={formData.birthDate}
  onChange={(value) => setFormData({...formData, birthDate: value})}
  required
  className="custom-styles"
/>
```

### 2. CalendarPopup Component
**Location**: `components/ui/calendar-popup.tsx`

An internal component used by DatePicker to render the interactive calendar.

### 3. Date Utilities
**Location**: `lib/date-utils.ts`

Utility functions for date formatting, parsing, and locale management:

```tsx
import { formatDate, parseDate, switchMomentLocale } from '@/lib/date-utils';

// Format a date for display
const displayDate = formatDate('2024-01-15', 'jYYYY/jMM/jDD', 'fa');

// Parse a user-entered date
const parsedDate = parseDate('1402/10/25', 'jYYYY/jMM/jDD', 'fa');

// Switch moment locale
switchMomentLocale('fa'); // or 'ar'
```

## Migration Guide

### Updating Existing Components

Replace all `<Input type="date" />` instances with the new `<DatePicker />`:

**Before:**
```tsx
<Input
  type="date"
  value={filters.dateFrom || ''}
  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
  className="bg-white/90"
/>
```

**After:**
```tsx
<DatePicker
  value={filters.dateFrom || ''}
  onChange={(value) => handleFilterChange('dateFrom', value)}
  className="bg-white/90"
/>
```

### Form Integration

For react-hook-form integration:

```tsx
// Controller approach
<Controller
  name="date"
  control={control}
  render={({ field }) => (
    <DatePicker
      value={field.value}
      onChange={field.onChange}
      placeholder="Select date"
    />
  )}
/>

// Register approach (for simple cases)
<DatePicker
  {...register('date')}
  placeholder="Select date"
/>
```

## Updated Components

The following components have been updated to use the new DatePicker:

1. **permissions-audit-list.tsx**
   - Date range filters now use DatePicker
   - Proper Persian/Arabic calendar support

2. **inventory-export-dialog.tsx** 
   - Start/end date selection with DatePicker
   - Consistent date formatting

3. **change-status-dialog.tsx**
   - Expected resolution date picker
   - RTL-aware date input

## Configuration

### Backend Locale Configuration

The date picker respects the locale configuration from the backend:

```typescript
interface LocaleFormattingResponse {
  data: {
    dateFormat: {
      calendar: 'persian' | 'gregorian';
      format: string;           // e.g., 'jYYYY/jMM/jDD'
      example: string;          // e.g., '1402/10/25'
    };
    // ... other locale settings
  };
}
```

### Translation Keys

Added to both `fa.json` and `ar.json`:

```json
{
  "common": {
    "today": "امروز", // "اليوم" in Arabic
    "openCalendar": "باز کردن تقویم" // "فتح التقويم" in Arabic
  }
}
```

## Technical Implementation

### Dependencies

- **jalali-moment**: Persian calendar support
- **moment.js**: Date manipulation and formatting
- **i18next**: Internationalization framework
- **React Hook Form**: Form integration (optional)

### Browser Support

- Modern browsers with ES6+ support
- Graceful fallback for older browsers
- Mobile responsive design

### Performance Considerations

- Lazy loading of calendar popup
- Memoized date formatting functions
- Efficient locale switching
- Minimal re-renders

## Testing

### Manual Testing Checklist

- [ ] Calendar icon appears on the right side
- [ ] Persian calendar shows Jalali dates
- [ ] Arabic calendar shows Gregorian dates  
- [ ] Keyboard navigation works
- [ ] Click outside closes calendar
- [ ] Today button works correctly
- [ ] RTL text direction is correct
- [ ] Date format matches locale config
- [ ] Form validation works
- [ ] Mobile responsive design

### Test Data

**Persian dates to test:**
- `1402/10/25` (should display as 25 دی 1402)
- `1403/01/01` (should display as 1 فروردین 1403)

**Arabic dates to test:**
- `2024/01/15` (should display as 15/01/2024)
- `2024/12/31` (should display as 31/12/2024)

## Troubleshooting

### Common Issues

1. **Date not displaying correctly**
   - Check locale configuration from backend
   - Verify moment.js locale is set correctly
   - Check date format string

2. **Calendar icon in wrong position**
   - Ensure CSS classes are applied correctly
   - Check for conflicting styles
   - Verify RTL directionality

3. **Calendar popup not appearing**
   - Check z-index conflicts
   - Verify click handlers are attached
   - Check for JavaScript errors

### Debug Mode

Enable debug logging:

```tsx
// In date-utils.ts, add logging
console.log('Current locale:', moment.locale());
console.log('Calendar type:', calendarType);
console.log('Date format:', dateFormat);
```

## Future Enhancements

1. **Custom Calendar Themes**
   - Persian calendar styling
   - Arabic calendar styling
   - Customizable color schemes

2. **Advanced Features**
   - Date range selection in single component
   - Keyboard shortcuts
   - Month/year picker
   - Holidays highlighting

3. **Performance Optimizations**
   - Virtual scrolling for year selection
   - Calendar component lazy loading
   - Date format caching

## Support

For issues or questions:
1. Check console for JavaScript errors
2. Verify locale configuration
3. Test with demo component
4. Review implementation documentation
