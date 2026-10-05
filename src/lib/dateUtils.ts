import {
  parseISO,
  format,
  isBefore,
  isAfter,
  addMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import { th } from 'date-fns/locale';
import { Booking, TimeSlot, ConflictCheckResult } from './types';

/**
 * ดึงเวลาปัจจุบันโดยอิงตามโซนเวลาประเทศไทย (Asia/Bangkok, UTC+7)
 */
export function getThailandNow(): Date {
  const now = new Date();
  const bkkStr = now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
  return new Date(bkkStr);
}

/**
 * แปลง Date หรือ ISO string ให้เป็น Date Object ในระบบเวลาประเทศไทย
 */
export function toThailandDate(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const bkkStr = d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
  return new Date(bkkStr);
}

/**
 * สมการตรวจสอบช่วงเวลาซ้อนทับกัน (Time Overlap Prevention Engine)
 * (StartA < EndB) AND (EndA > StartB)
 */
export function checkTimeOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return isBefore(startA, endB) && isAfter(endA, startB);
}

/**
 * ตรวจสอบความขัดแย้งกับรายการจองที่มีอยู่แล้วในระบบ
 */
export function validateBookingConflict(
  roomId: string,
  newStartISO: string,
  newEndISO: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): ConflictCheckResult {
  const bkkNow = getThailandNow();
  const newStart = toThailandDate(newStartISO);
  const newEnd = toThailandDate(newEndISO);

  // ตรวจสอบว่าช่วงเวลาเริ่มต้นอยู่ในอดีตหรือไม่ (อิงตามเวลาประเทศไทย)
  if (isBefore(newStart, bkkNow)) {
    return {
      hasConflict: true,
      message: 'ไม่สามารถเลือกช่วงเวลาในอดีตได้ครับ กรุณาเลือกช่วงเวลาปัจจุบันหรืออนาคต',
    };
  }

  // ตรวจสอบว่าเวลาจบต้องหลังเวลาเริ่ม
  if (!isBefore(newStart, newEnd)) {
    return {
      hasConflict: true,
      message: 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้นครับ',
    };
  }

  // กรองเฉพาะการจองของห้องเดียวกัน และไม่รวมรายการที่ถูกยกเลิกแล้ว
  const roomBookings = existingBookings.filter(
    (b) =>
      b.roomId === roomId &&
      b.status !== 'cancelled' &&
      b.id !== excludeBookingId
  );

  for (const booking of roomBookings) {
    const existingStart = toThailandDate(booking.startTime);
    const existingEnd = toThailandDate(booking.endTime);

    if (checkTimeOverlap(newStart, newEnd, existingStart, existingEnd)) {
      const formattedStart = format(existingStart, 'HH:mm');
      const formattedEnd = format(existingEnd, 'HH:mm');
      return {
        hasConflict: true,
        conflictingBooking: booking,
        message: `ช่วงเวลานี้ชนกับการจองของคุณ "${booking.bookerName}" (${formattedStart} - ${formattedEnd} น.)`,
      };
    }
  }

  return {
    hasConflict: false,
    message: 'ช่วงเวลานี้ว่าง สามารถทำการจองได้ครับ',
  };
}

/**
 * คำนวณสร้าง Time Slots สำหรับวันและห้องที่เลือก (อิงตามเวลาประเทศไทย)
 */
export function generateDayTimeSlots(
  selectedDate: Date,
  roomId: string,
  existingBookings: Booking[],
  startHour: number = 8,
  endHour: number = 18,
  slotDurationMinutes: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const bkkNow = getThailandNow();
  const bkkSelected = toThailandDate(selectedDate);

  // สร้างจุดเริ่มต้นของวัน ณ เวลา startHour:00
  let currentSlotStart = setMilliseconds(
    setSeconds(setMinutes(setHours(bkkSelected, startHour), 0), 0),
    0
  );
  const dayEndThreshold = setHours(bkkSelected, endHour);

  // กรองการจองของห้องนี้
  const roomBookings = existingBookings.filter(
    (b) => b.roomId === roomId && b.status !== 'cancelled'
  );

  while (isBefore(currentSlotStart, dayEndThreshold)) {
    const currentSlotEnd = addMinutes(currentSlotStart, slotDurationMinutes);
    const slotStartISO = currentSlotStart.toISOString();
    const slotEndISO = currentSlotEnd.toISOString();

    // เช็กว่า slot นี้เริ่มก่อนเวลาปัจจุบันในประเทศไทยหรือไม่ (ถ้าใช่ ถือว่าผ่านไปแล้ว)
    const isPast = isBefore(currentSlotStart, bkkNow);

    // เช็กว่า slot นี้ตรงกับช่วงเวลาการจองใดหรือไม่
    const matchedBooking = roomBookings.find((b) => {
      const bStart = toThailandDate(b.startTime);
      const bEnd = toThailandDate(b.endTime);
      return checkTimeOverlap(currentSlotStart, currentSlotEnd, bStart, bEnd);
    });

    const isAvailable = !isPast && !matchedBooking;

    slots.push({
      timeLabel: `${format(currentSlotStart, 'HH:mm')} - ${format(currentSlotEnd, 'HH:mm')}`,
      startTime: slotStartISO,
      endTime: slotEndISO,
      isAvailable,
      isPast,
      booking: matchedBooking,
    });

    currentSlotStart = currentSlotEnd;
  }

  return slots;
}

/**
 * ฟังก์ชันช่วยแปลงรูปแบบวันที่ภาษาไทย
 */
export function formatThaiDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEEที่ d MMMM yyyy', { locale: th });
}

export function formatTimeRange(startISO: string, endISO: string): string {
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')} น.`;
}
