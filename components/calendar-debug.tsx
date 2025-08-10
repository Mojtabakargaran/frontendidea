'use client';

import React from 'react';
import moment from 'jalali-moment';

/**
 * Debug component to test Persian calendar week start
 */
export default function CalendarDebug() {
  // Today's date
  const today = moment();
  
  // Set Persian locale
  const persianToday = moment().locale('fa');
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-bold text-lg mb-4">Calendar Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Today (Gregorian):</strong> {today.format('YYYY-MM-DD dddd')}
        </div>
        <div>
          <strong>Today (Persian):</strong> {persianToday.format('jYYYY/jMM/jDD dddd')}
        </div>
        <div>
          <strong>Day of week (0=Sun, 6=Sat):</strong> {today.day()}
        </div>
        <div>
          <strong>Persian weekdays should be:</strong> Saturday (ش), Sunday (ی), Monday (د), Tuesday (س), Wednesday (چ), Thursday (پ), Friday (ج)
        </div>
        
        <hr className="my-4" />
        
        <div>
          <strong>Week calculation test:</strong>
        </div>
        {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
          const testDate = moment().day(dayOfWeek);
          let daysToGoBack;
          if (dayOfWeek === 6) {
            daysToGoBack = 0; // Already Saturday
          } else {
            daysToGoBack = dayOfWeek + 1; // Go back to previous Saturday
          }
          const startOfWeek = testDate.clone().subtract(daysToGoBack, 'days');
          
          return (
            <div key={dayOfWeek}>
              Day {dayOfWeek} ({testDate.format('dddd')}): Go back {daysToGoBack} days → {startOfWeek.format('dddd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
