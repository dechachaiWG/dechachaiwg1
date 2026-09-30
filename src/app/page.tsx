'use client';

import React, { useState, useEffect } from 'react';
import { Room, Booking, TimeSlot, AuthSessionUser } from '@/lib/types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS } from '@/lib/mockData';
import { generateDayTimeSlots, formatThaiDate } from '@/lib/dateUtils';
import { Navbar } from '@/components/Navbar';
import { RoomCard } from '@/components/RoomCard';
import { CalendarPicker } from '@/components/CalendarPicker';
import { TimeSlotGrid } from '@/components/TimeSlotGrid';
import { BookingModal } from '@/components/BookingModal';
import { DashboardView } from '@/components/DashboardView';
import { CustomerManagementView } from '@/components/CustomerManagementView';
import { AuthModal } from '@/components/AuthModal';
import { Calendar, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'booking' | 'dashboard' | 'customers'>('booking');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [selectedRoom, setSelectedRoom] = useState<Room>(INITIAL_ROOMS[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [selectedStartSlot, setSelectedStartSlot] = useState<TimeSlot | null>(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Authentication & Theme State
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = (localStorage.getItem('reservespace_theme') as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('reservespace_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Check existing session & fetch local bookings
  useEffect(() => {
    async function initApp() {
      // 1. Fetch current session user
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (authData.user) {
          setCurrentUser(authData.user);
        }
      } catch (err) {
        console.error('Failed to check user session', err);
      }

      // 2. Fetch bookings from local database API
      try {
        const bookingsRes = await fetch('/api/bookings');
        const bookingsData = await bookingsRes.json();
        if (bookingsData.bookings && Array.isArray(bookingsData.bookings)) {
          setBookings(bookingsData.bookings);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch local bookings', err);
      }

      // Fallback to LocalStorage
      const saved = localStorage.getItem('reservespace_bookings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBookings(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved bookings', e);
        }
      }
    }

    initApp();
  }, []);

  // Save state to localStorage as secondary backup
  useEffect(() => {
    localStorage.setItem('reservespace_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      showToast('ออกจากระบบเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Generate time slots for selected room and date
  const slots = generateDayTimeSlots(selectedDate, selectedRoom.id, bookings);

  // Handle Slot Click
  const handleSelectSlot = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;

    if (!selectedStartSlot) {
      setSelectedStartSlot(slot);
      setSelectedEndSlot(null);
    } else if (!selectedEndSlot && new Date(slot.startTime) > new Date(selectedStartSlot.startTime)) {
      setSelectedEndSlot(slot);
    } else {
      setSelectedStartSlot(slot);
      setSelectedEndSlot(null);
    }
  };

  // Add new booking directly saved to local database
  const handleAddBooking = async (newBookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const isCustomer = currentUser?.role !== 'admin';
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBookingData,
          customerId: currentUser?.id,
          userRole: currentUser?.role || 'customer',
          status: isCustomer ? 'pending' : 'confirmed',
        }),
      });

      const data = await res.json();
      if (res.ok && data.booking) {
        // Fetch fresh state directly from database file
        const freshRes = await fetch('/api/bookings');
        const freshData = await freshRes.json();
        if (freshData.bookings && Array.isArray(freshData.bookings)) {
          setBookings(freshData.bookings);
        } else {
          setBookings((prev) => [data.booking, ...prev]);
        }
      }
    } catch (err) {
      console.error('API create booking failed', err);
    }

    setSelectedStartSlot(null);
    setSelectedEndSlot(null);
    if (isCustomer) {
      showToast(`ส่งรายการจองห้อง "${selectedRoom.name}" แล้ว! (รอ Admin ตรวจสอบและอนุมัติคิว)`);
    } else {
      showToast(`อนุมัติและจองห้อง "${selectedRoom.name}" สำเร็จเรียบร้อยแล้วครับ!`);
    }
  };

  // Update booking status directly in local database (Approve / Reject / Cancel)
  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: 'confirmed' | 'pending' | 'cancelled'
  ) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      });

      if (res.ok) {
        const freshRes = await fetch('/api/bookings');
        const freshData = await freshRes.json();
        if (freshData.bookings && Array.isArray(freshData.bookings)) {
          setBookings(freshData.bookings);
        }
      }
    } catch (err) {
      console.error('API update booking status failed', err);
    }

    if (status === 'confirmed') {
      showToast('อนุมัติรายการจองคิวเรียบร้อยแล้วครับ');
    } else if (status === 'cancelled') {
      showToast('ยกเลิกรายการจองคิวเรียบร้อยแล้วครับ');
    } else {
      showToast('ปรับสถานะเป็นรอการตรวจสอบเรียบร้อยแล้วครับ');
    }
  };

  const handleCancelBooking = (bookingId: string) =>
    handleUpdateBookingStatus(bookingId, 'cancelled');

  const bookingCountToday = bookings.filter(
    (b) => b.status === 'confirmed' && isToday(parseISO(b.startTime))
  ).length;

  return (
    <div className="min-h-screen bg-stone-100/60 dark:bg-slate-950 text-stone-900 dark:text-slate-100 font-sans antialiased pb-16 transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 dark:bg-slate-800 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-xl border border-stone-800 dark:border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingCountToday={bookingCountToday}
        currentUser={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TAB 1: Booking Schedule */}
        {activeTab === 'booking' && (
          <div className="space-y-6">
            {/* Top Banner / Hero Intro */}
            <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-800/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Time Overlap Engine Active
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secure Local Database Ready
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                  ระบบจองห้องประชุมและจัดคิว
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  เลือกห้องที่ต้องการ ตรวจสอบช่วงเวลาที่ว่างในปฏิทิน แล้วกดจองได้ทันที
                  ระบบจะตรวจเช็กเงื่อนไขเวลาไม่ให้คิวทับซ้อนกันโดยอัตโนมัติ พร้อมบันทึกเข้าสู่ฐานข้อมูลลูกค้า
                </p>
              </div>
            </div>

            {/* Date Selector Row */}
            <CalendarPicker
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedStartSlot(null);
                setSelectedEndSlot(null);
              }}
            />

            {/* Main Booking Content Grid: Rooms Left, Slots Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Rooms List Column (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-stone-900">
                    เลือกห้องประชุม ({rooms.length} ห้อง)
                  </h3>
                  <span className="text-xs text-stone-500">คลิกเพื่อสลับตารางเวลา</span>
                </div>

                <div className="space-y-3">
                  {rooms.map((room) => {
                    const roomTodayCount = bookings.filter(
                      (b) =>
                        b.roomId === room.id &&
                        b.status === 'confirmed' &&
                        isToday(parseISO(b.startTime))
                    ).length;

                    return (
                      <RoomCard
                        key={room.id}
                        room={room}
                        isSelected={selectedRoom.id === room.id}
                        onSelect={(r) => {
                          setSelectedRoom(r);
                          setSelectedStartSlot(null);
                          setSelectedEndSlot(null);
                        }}
                        bookingCountToday={roomTodayCount}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Column (7 cols) */}
              <div className="lg:col-span-7">
                <TimeSlotGrid
                  room={selectedRoom}
                  selectedDate={selectedDate}
                  slots={slots}
                  selectedStartSlot={selectedStartSlot}
                  selectedEndSlot={selectedEndSlot}
                  onSelectSlot={handleSelectSlot}
                  onOpenBookingModal={() => setIsModalOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Dashboard View */}
        {activeTab === 'dashboard' && (
          <DashboardView
            bookings={bookings}
            rooms={rooms}
            currentUser={currentUser}
            onCancelBooking={handleCancelBooking}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* TAB 3: Customer Database / Profile */}
        {activeTab === 'customers' && (
          <CustomerManagementView
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={selectedRoom}
        selectedDate={selectedDate}
        initialStartSlot={selectedStartSlot}
        initialEndSlot={selectedEndSlot}
        existingBookings={bookings}
        currentUser={currentUser}
        onSubmitBooking={handleAddBooking}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`ยินดีต้อนรับ ${user.fullName} เข้าสู่ระบบเรียบร้อยแล้ว`);
        }}
      />
    </div>
  );
}
