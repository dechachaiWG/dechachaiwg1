'use client';

import React from 'react';
import {
  format,
  addDays,
  subDays,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  eachDayOfInterval,
  addWeeks,
} from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const today = startOfDay(new Date());

  // สร้างรายการวันที่ 14 วันถัดไปเริ่มจากวันนี้
  const nextTwoWeeks = eachDayOfInterval({
    start: today,
    end: addDays(today, 13),
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-stone-200/80 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
              {format(selectedDate, 'MMMM yyyy', { locale: th })}
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400">
              เลือกวันที่ต้องการตรวจสอบตารางเวลา
            </p>
          </div>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onSelectDate(today)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              isToday(selectedDate)
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            วันนี้
          </button>
          <button
            onClick={() => onSelectDate(addDays(today, 1))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              isSameDay(selectedDate, addDays(today, 1))
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            พรุ่งนี้
          </button>
          <button
            onClick={() => onSelectDate(addDays(today, 2))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              isSameDay(selectedDate, addDays(today, 2))
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            อีก 2 วัน
          </button>
        </div>
      </div>

      {/* Horizon Day Strip */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-14 sm:gap-1.5 pb-1 sm:pb-0">
        {nextTwoWeeks.map((date) => {
          const isSelected = isSameDay(selectedDate, date);
          const isCurrentToday = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={`min-w-[58px] sm:min-w-0 flex-shrink-0 sm:flex-shrink flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/20 scale-102 font-semibold'
                  : isCurrentToday
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/80'
                  : 'bg-stone-50 dark:bg-slate-800/80 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 border border-stone-200/60 dark:border-slate-700'
              }`}
            >
              <span className="text-[11px] font-medium opacity-80 mb-0.5">
                {format(date, 'EEE', { locale: th })}
              </span>
              <span className="text-sm font-semibold">
                {format(date, 'd')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
