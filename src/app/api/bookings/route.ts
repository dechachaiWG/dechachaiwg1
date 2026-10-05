import { NextResponse } from 'next/server';
import { getBookings, createBookingInDb, updateBookingStatusInDb } from '@/lib/db';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

import { getThailandNow, toThailandDate } from '@/lib/dateUtils';
import { isBefore } from 'date-fns';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, customerId, title, bookerName, bookerEmail, bookerPhone, startTime, endTime, notes, userRole, status } = body;

    if (!roomId || !title || !bookerName || !bookerEmail || !startTime || !endTime) {
      return NextResponse.json({ error: 'ข้อมูลการจองไม่ครบถ้วน' }, { status: 400 });
    }

    // ตรวจสอบว่าช่วงเวลาเริ่มต้นอยู่ในอดีตหรือไม่ (อิงตามโซนเวลาประเทศไทย)
    const bkkNow = getThailandNow();
    const newStart = toThailandDate(startTime);
    if (isBefore(newStart, bkkNow)) {
      return NextResponse.json(
        { error: 'ไม่สามารถจองช่วงเวลาในอดีตได้ครับ กรุณาเลือกช่วงเวลาปัจจุบันหรืออนาคต' },
        { status: 400 }
      );
    }

    // Default status:
    // Admin bookings are automatically 'confirmed'
    // General customer bookings default to 'pending' waiting for admin approval
    const initialStatus = status || (userRole === 'admin' ? 'confirmed' : 'pending');

    const booking = await createBookingInDb({
      roomId,
      customerId,
      title,
      bookerName,
      bookerEmail,
      bookerPhone,
      startTime,
      endTime,
      status: initialStatus,
      notes: notes || '',
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสการจอง' }, { status: 400 });
    }

    const targetStatus = status || 'cancelled';
    const ok = await updateBookingStatusInDb(bookingId, targetStatus);
    if (!ok) {
      return NextResponse.json({ error: 'ไม่พบรายการจอง' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `อัปเดตสถานะการจองเป็น ${targetStatus} เรียบร้อยแล้ว`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}
