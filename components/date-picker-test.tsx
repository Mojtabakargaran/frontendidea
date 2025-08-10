'use client';

import React, { useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';

/**
 * Test component to verify DatePicker calendar-only functionality
 */
export default function DatePickerTest() {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Date Picker Test</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="test-date" className="block text-sm font-medium mb-2">
            Select a Date (Calendar Only)
          </label>
          <DatePicker
            id="test-date"
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Click to select date"
          />
        </div>
        
        {selectedDate && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <strong>Selected Date:</strong> {selectedDate}
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p>• Click anywhere on the input field to open calendar</p>
          <p>• Press Enter or Space when focused to open calendar</p>
          <p>• Press Escape to close calendar</p>
          <p>• Manual typing is disabled</p>
        </div>
      </div>
    </div>
  );
}
