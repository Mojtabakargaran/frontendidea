'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

/**
 * Date Picker Demo Component
 * Demonstrates the new internationalized date picker functionality
 */
export function DatePickerDemo() {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const switchLanguage = (lang: 'fa' | 'ar') => {
    i18n.changeLanguage(lang);
  };

  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🗓️ {t('common.openCalendar')} - Demo
          </CardTitle>
          <CardDescription>
            Demonstration of the new internationalized date picker with Persian (Shamsi) and Arabic (Gregorian) calendar support
          </CardDescription>
          
          {/* Language Switcher */}
          <div className="flex gap-2 mt-4">
            <Button 
              variant={i18n.language === 'fa' ? 'default' : 'outline'}
              onClick={() => switchLanguage('fa')}
              size="sm"
            >
              فارسی (Persian)
            </Button>
            <Button 
              variant={i18n.language === 'ar' ? 'default' : 'outline'}
              onClick={() => switchLanguage('ar')}
              size="sm"
            >
              العربية (Arabic)
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Single Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="single-date">
              {i18n.language === 'fa' ? 'تاریخ انتخابی' : 'تاريخ مختار'}
            </Label>
            <DatePicker
              id="single-date"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder={i18n.language === 'fa' ? 'یک تاریخ انتخاب کنید' : 'اختر تاريخاً'}
              className="max-w-xs"
            />
            {selectedDate && (
              <p className="text-sm text-gray-600">
                {i18n.language === 'fa' ? 'تاریخ انتخاب شده:' : 'التاريخ المختار:'} {selectedDate}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">
                {i18n.language === 'fa' ? 'تاریخ شروع' : 'تاريخ البداية'}
              </Label>
              <DatePicker
                id="start-date"
                value={startDate}
                onChange={setStartDate}
                placeholder={i18n.language === 'fa' ? 'تاریخ شروع' : 'تاريخ البداية'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">
                {i18n.language === 'fa' ? 'تاریخ پایان' : 'تاريخ النهاية'}
              </Label>
              <DatePicker
                id="end-date"
                value={endDate}
                onChange={setEndDate}
                placeholder={i18n.language === 'fa' ? 'تاریخ پایان' : 'تاريخ النهاية'}
              />
            </div>
          </div>

          {/* Display Selected Range */}
          {(startDate || endDate) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                {i18n.language === 'fa' ? 'بازه انتخاب شده:' : 'النطاق المختار:'}
              </h4>
              <div className="text-sm text-blue-800">
                {startDate && (
                  <p>
                    {i18n.language === 'fa' ? 'از:' : 'من:'} {startDate}
                  </p>
                )}
                {endDate && (
                  <p>
                    {i18n.language === 'fa' ? 'تا:' : 'إلى:'} {endDate}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              {i18n.language === 'fa' ? 'ویژگی‌های جدید:' : 'الميزات الجديدة:'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>
                  {i18n.language === 'fa' 
                    ? 'پشتیبانی از تقویم شمسی (جلالی) برای فارسی' 
                    : 'دعم التقويم الشمسي (الجلالي) للفارسية'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>
                  {i18n.language === 'fa' 
                    ? 'پشتیبانی از تقویم میلادی برای عربی (امارات)' 
                    : 'دعم التقويم الميلادي للعربية (الإمارات)'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>
                  {i18n.language === 'fa' 
                    ? 'آیکون تقویم در سمت راست برای UX بهتر' 
                    : 'أيقونة التقويم على الجانب الأيمن لتجربة مستخدم أفضل'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>
                  {i18n.language === 'fa' 
                    ? 'فرمت‌بندی خودکار تاریخ بر اساس منطقه' 
                    : 'تنسيق التاريخ التلقائي حسب المنطقة'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>
                  {i18n.language === 'fa' 
                    ? 'پاپ‌اپ تقویم تعاملی با پشتیبانی کامل از کیبورد' 
                    : 'نافذة تقويم تفاعلية مع دعم كامل للوحة المفاتيح'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>
                  {i18n.language === 'fa' 
                    ? 'طراحی واکنش‌گرا و قابل دسترس' 
                    : 'تصميم مستجيب وقابل للوصول'
                  }
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DatePickerDemo;
