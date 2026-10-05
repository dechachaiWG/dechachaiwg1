'use client';

import React, { useState, useEffect } from 'react';
import { Room, Booking, TimeSlot, ConflictCheckResult, AuthSessionUser } from '@/lib/types';
import { validateBookingConflict, formatThaiDate, getThailandNow, toThailandDate } from '@/lib/dateUtils';
import { X, CheckCircle2, AlertTriangle, Clock, User, Mail, FileText, Calendar } from 'lucide-react';
import { setHours, setMinutes, formatISO, parseISO, format, isToday, isBefore } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  selectedDate: Date;
  initialStartSlot: TimeSlot | null;
  initialEndSlot: TimeSlot | null;
  existingBookings: Booking[];
  currentUser?: AuthSessionUser | null;
  onSubmitBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  room,
  selectedDate,
  initialStartSlot,
  initialEndSlot,
  existingBookings,
  currentUser,
  onSubmitBooking,
}) => {
  // 08:00 to 18:00 options
  const timeOptions: string[] = [];
  for (let h = 8; h <= 18; h++) {
    const hh = h.toString().padStart(2, '0');
    timeOptions.push(`${hh}:00`);
    if (h < 18) {
      timeOptions.push(`${hh}:30`);
    }
  }

  const checkIsPastTime = (timeStr: string) => {
    const bkkNow = getThailandNow();
    const bkkSelected = toThailandDate(selectedDate);
    const [h, m] = timeStr.split(':').map(Number);
    const dt = setMinutes(setHours(bkkSelected, h), m);
    return isBefore(dt, bkkNow);
  };

  const defaultStartTime = initialStartSlot
    ? format(parseISO(initialStartSlot.startTime), 'HH:mm')
    : '09:00';

  const defaultEndTime = initialEndSlot
    ? format(parseISO(initialEndSlot.endTime), 'HH:mm')
    : initialStartSlot
    ? format(parseISO(initialStartSlot.endTime), 'HH:mm')
    : '10:00';

  const [startTimeStr, setStartTimeStr] = useState(defaultStartTime);
  const [endTimeStr, setEndTimeStr] = useState(defaultEndTime);
  const [title, setTitle] = useState('');
  const [bookerName, setBookerName] = useState(currentUser?.fullName || '');
  const [bookerEmail, setBookerEmail] = useState(currentUser?.email || '');
  const [notes, setNotes] = useState('');

  // Update defaults when modal opens or selected slots change or user changes
  useEffect(() => {
    if (currentUser) {
      setBookerName(currentUser.fullName);
      setBookerEmail(currentUser.email);
    }
    if (initialStartSlot) {
      setStartTimeStr(format(parseISO(initialStartSlot.startTime), 'HH:mm'));
    }
    if (initialEndSlot) {
      setEndTimeStr(format(parseISO(initialEndSlot.endTime), 'HH:mm'));
    } else if (initialStartSlot) {
      setEndTimeStr(format(parseISO(initialStartSlot.endTime), 'HH:mm'));
    }
  }, [initialStartSlot, initialEndSlot, currentUser]);

  if (!isOpen) return null;

  // Compute ISO Start and End time from selectedDate + time strings
  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  const startDateTime = setMinutes(setHours(selectedDate, startH), startM);
  const endDateTime = setMinutes(setHours(selectedDate, endH), endM);

  const startTimeISO = formatISO(startDateTime);
  const endTimeISO = formatISO(endDateTime);

  // Live Conflict Validation
  const conflictResult: ConflictCheckResult = validateBookingConflict(
    room.id,
    startTimeISO,
    endTimeISO,
    existingBookings
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictResult.hasConflict) return;
    if (!title.trim() || !bookerName.trim() || !bookerEmail.trim()) return;

    onSubmitBooking({
      roomId: room.id,
      title: title.trim(),
      bookerName: bookerName.trim(),
      bookerEmail: bookerEmail.trim(),
      startTime: startTimeISO,
      endTime: endTimeISO,
      status: 'confirmed',
      notes: notes.trim(),
    });

    // Reset Form
    setTitle('');
    setBookerName('');
    setBookerEmail('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 dark:bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-stone-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between bg-stone-50/50 dark:bg-slate-800/50">
          <div>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              จองห้องประชุม
            </span>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white mt-1">
              {room.name}
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400">
              {formatThaiDate(selectedDate)} ({room.location})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 flex items-center justify-center text-stone-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Time Selector Row */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
              ช่วงเวลาที่ต้องการจอง
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-stone-500 dark:text-slate-400 block mb-1">เวลาเริ่ม</span>
                <select
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                >
                  {timeOptions.slice(0, -1).map((t) => {
                    const isPast = checkIsPastTime(t);
                    return (
                      <option key={t} value={t} disabled={isPast}>
                        {t} น. {isPast ? '(ผ่านไปแล้ว)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-stone-500 dark:text-slate-400 block mb-1">เวลาสิ้นสุด</span>
                <select
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                >
                  {timeOptions.slice(1).map((t) => {
                    const isPast = checkIsPastTime(t);
                    return (
                      <option key={t} value={t} disabled={isPast}>
                        {t} น. {isPast ? '(ผ่านไปแล้ว)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Live Conflict Feedback Banner */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              conflictResult.hasConflict
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            {conflictResult.hasConflict ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{conflictResult.message}</p>
              {conflictResult.hasConflict && (
                <p className="text-[11px] opacity-80 mt-0.5">
                  โปรดเลือกช่วงเวลาอื่นที่ไม่มีการจองทับซ้อนกันนะครับ
                </p>
              )}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
              หัวข้อการประชุม / วัตถุประสงค์ *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ประชุมวางแผนงาน Q4, Client Demo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          {/* Booker Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                ชื่อผู้จอง *
              </label>
              <input
                type="text"
                required
                placeholder="ชื่อ-นามสกุล"
                value={bookerName}
                onChange={(e) => setBookerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                อีเมลติดต่อ *
              </label>
              <input
                type="email"
                required
                placeholder="email@company.com"
                value={bookerEmail}
                onChange={(e) => setBookerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={2}
              placeholder="เช่น ต้องการไมโครโฟนเพิ่ม, เตรียมเครื่องดื่ม"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={conflictResult.hasConflict || !title.trim() || !bookerName.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-sm ${
                conflictResult.hasConflict || !title.trim() || !bookerName.trim()
                  ? 'bg-stone-300 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              ยืนยันการจองคิว
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
