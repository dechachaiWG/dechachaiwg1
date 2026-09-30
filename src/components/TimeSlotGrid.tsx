'use client';

import React from 'react';
import { TimeSlot, Room, Booking } from '@/lib/types';
import { Clock, User, Check, AlertCircle, Sparkles } from 'lucide-react';
import { formatThaiDate } from '@/lib/dateUtils';

interface TimeSlotGridProps {
  room: Room;
  selectedDate: Date;
  slots: TimeSlot[];
  selectedStartSlot: TimeSlot | null;
  selectedEndSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  onOpenBookingModal: () => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  room,
  selectedDate,
  slots,
  selectedStartSlot,
  selectedEndSlot,
  onSelectSlot,
  onOpenBookingModal,
}) => {
  const availableCount = slots.filter((s) => s.isAvailable).length;
  const bookedCount = slots.filter((s) => s.booking).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-stone-200/80 dark:border-slate-800 shadow-sm transition-colors">
      {/* Header Info & Status Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-stone-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-base font-semibold text-stone-900 dark:text-white">
              ตารางเวลาห้อง: {room.name}
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400">
            ประจำ{formatThaiDate(selectedDate)} (ว่าง {availableCount} ช่วงเวลา / จองแล้ว {bookedCount} ช่วงเวลา)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700"></span>
            <span className="text-stone-600 dark:text-slate-300 font-medium">ว่าง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-stone-200 dark:bg-slate-700 border border-stone-300 dark:border-slate-600"></span>
            <span className="text-stone-600 dark:text-slate-300 font-medium">มีผู้จองแล้ว</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-700"></span>
            <span className="text-stone-600 dark:text-slate-300 font-medium">เลือกอยู่</span>
          </div>
        </div>
      </div>

      {/* Selected Slot Banner Callout */}
      {selectedStartSlot && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>
              คุณเลือกเวลาเริ่มต้น:{' '}
              <strong className="font-semibold text-emerald-950 dark:text-emerald-100">
                {selectedStartSlot.timeLabel.split(' - ')[0]} น.
              </strong>{' '}
              {selectedEndSlot ? (
                <>
                  ถึง{' '}
                  <strong className="font-semibold text-emerald-950 dark:text-emerald-100">
                    {selectedEndSlot.timeLabel.split(' - ')[1]} น.
                  </strong>
                </>
              ) : (
                '(คลิกเลือกเวลาสิ้นสุด หรือกดกรอกฟอร์มได้เลยครับ)'
              )}
            </span>
          </div>
          <button
            onClick={onOpenBookingModal}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span>ดำเนินการกรอกข้อมูลจอง</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {slots.map((slot) => {
          const isSelectedStart = selectedStartSlot?.startTime === slot.startTime;
          const isSelectedEnd = selectedEndSlot?.endTime === slot.endTime;

          // Check if slot falls between selected start and end
          const inRange =
            selectedStartSlot &&
            selectedEndSlot &&
            new Date(slot.startTime) >= new Date(selectedStartSlot.startTime) &&
            new Date(slot.endTime) <= new Date(selectedEndSlot.endTime);

          if (slot.booking) {
            // Booked State
            return (
              <div
                key={slot.startTime}
                title={`จองโดย: ${slot.booking.bookerName} (${slot.booking.title})`}
                className="group relative p-3 rounded-xl bg-stone-100 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-800 text-stone-400 dark:text-slate-500 cursor-not-allowed flex flex-col justify-between min-h-[72px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 dark:text-slate-400">
                    {slot.timeLabel}
                  </span>
                  <span className="text-[10px] font-medium bg-stone-200 dark:bg-slate-700 text-stone-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                    จองแล้ว
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-600 dark:text-slate-400 truncate">
                  <User className="w-3 h-3 text-stone-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="truncate">{slot.booking.bookerName}</span>
                </div>
              </div>
            );
          }

          if (slot.isPast) {
            // Past Slot State
            return (
              <div
                key={slot.startTime}
                className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950/60 border border-stone-100 dark:border-slate-900 text-stone-300 dark:text-slate-700 cursor-not-allowed flex flex-col justify-between min-h-[72px]"
              >
                <span className="text-xs font-medium">{slot.timeLabel}</span>
                <span className="text-[10px] text-stone-400 dark:text-slate-600">ผ่านไปแล้ว</span>
              </div>
            );
          }

          // Available State / Selected State
          return (
            <button
              key={slot.startTime}
              onClick={() => onSelectSlot(slot)}
              className={`p-3 rounded-xl text-left transition-all duration-150 flex flex-col justify-between min-h-[72px] border ${
                isSelectedStart || isSelectedEnd || inRange
                  ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-800 dark:border-emerald-500 shadow-sm scale-102 ring-2 ring-emerald-600/30'
                  : 'bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border-emerald-200/80 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-semibold ${
                    isSelectedStart || isSelectedEnd || inRange
                      ? 'text-white'
                      : 'text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  {slot.timeLabel}
                </span>
                {(isSelectedStart || isSelectedEnd || inRange) && (
                  <Check className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium ${
                  isSelectedStart || isSelectedEnd || inRange
                    ? 'text-emerald-100'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {isSelectedStart ? 'เวลาเริ่ม' : inRange ? 'เลือกอยู่' : 'ว่าง - คลิกเพื่อเลือก'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
