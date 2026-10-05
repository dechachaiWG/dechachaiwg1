'use client';

import React, { useState } from 'react';
import { Booking, Room, AuthSessionUser, BookingStatus } from '@/lib/types';
import { formatThaiDate, formatTimeRange } from '@/lib/dateUtils';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Building,
  Users,
  Shield,
  LogIn,
  Check,
} from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

interface DashboardViewProps {
  bookings: Booking[];
  rooms: Room[];
  currentUser?: AuthSessionUser | null;
  onCancelBooking: (bookingId: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: BookingStatus) => void;
  onOpenAuth?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bookings,
  rooms,
  currentUser,
  onCancelBooking,
  onUpdateBookingStatus,
  onOpenAuth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Role-based booking isolation:
  // Admin -> sees ALL bookings in the system.
  // Customer -> sees ONLY their OWN bookings.
  const myBookings = bookings.filter((b) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return (
      b.customerId === currentUser.id ||
      b.bookerEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
  });

  // Stats calculation based on permitted bookings
  const totalBookings = myBookings.length;
  const pendingCount = myBookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = myBookings.filter((b) => b.status === 'confirmed').length;
  const todayBookingsCount = myBookings.filter(
    (b) => b.status === 'confirmed' && isToday(parseISO(b.startTime))
  ).length;

  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  // Filtered Bookings list based on search and filters
  const filteredBookings = myBookings.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRoom =
      selectedRoomFilter === 'all' || b.roomId === selectedRoomFilter;
    const matchesStatus =
      statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesRoom && matchesStatus;
  });

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-sm text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
          เข้าสู่ระบบเพื่อดูสรุปรายการจองของคุณ
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 leading-relaxed mb-6">
          กรุณาเข้าสู่ระบบเพื่อตรวจสอบ ตรวจเช็กคิว และจัดการรายการจองห้องประชุมของคุณ
        </p>
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบ / ลงทะเบียนสมาชิก</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Today Bookings */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-slate-400">การจองวันนี้</span>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {todayBookingsCount} <span className="text-xs font-normal text-stone-500 dark:text-slate-400">รายการ</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">คิวแอคทีฟพร้อมใช้งาน</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Pending Admin Approvals */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-slate-400">รอ Admin อนุมัติคิว</span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {pendingCount} <span className="text-xs font-normal text-stone-500 dark:text-slate-400">รายการ</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
              {currentUser.role === 'admin' ? 'ต้องการการตรวจสอบอนุมัติ' : 'รอผู้ดูแลระบบตรวจสอบ'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Confirmed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-slate-400">อนุมัติเรียบร้อยแล้ว</span>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {confirmedCount} <span className="text-xs font-normal text-stone-500 dark:text-slate-400">รายการ</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">ยืนยันสิทธิ์การเข้าใช้ห้อง</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-stone-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              {currentUser?.role === 'admin' ? (
                <>
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>รายการจองทั้งหมดในระบบ (Admin Dashboard)</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>รายการจองคิวของคุณ (My Booking Dashboard)</span>
                </>
              )}
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              {currentUser?.role === 'admin'
                ? 'ตรวจสอบ อนุมัติคิว หรือยกเลิกการจองของผู้ใช้งานในระบบ'
                : 'ตรวจสอบ รายละเอียด และสถานะอนุมัติคิวห้องประชุมของคุณ'}
            </p>
          </div>

          {/* Search & Select Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-auto min-w-[200px] flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้จอง / หัวข้อ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 sm:py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            {/* Room Filter */}
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-medium text-stone-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">ทุกห้องประชุม</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-medium text-stone-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอการอนุมัติ (Pending)</option>
              <option value="confirmed">อนุมัติแล้ว (Confirmed)</option>
              <option value="cancelled">ยกเลิกแล้ว (Cancelled)</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="py-12 text-center text-stone-400 dark:text-slate-500">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-stone-600 dark:text-slate-400">ไม่พบรายการจองที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-stone-400 dark:text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองเป็น "ทุกสถานะ" ครับ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-slate-800 text-[11px] font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider bg-stone-50/60 dark:bg-slate-800/60">
                  <th className="py-3.5 px-4 rounded-l-xl">ห้องประชุม</th>
                  <th className="py-3.5 px-4">หัวข้อการประชุม</th>
                  <th className="py-3.5 px-4">ผู้จอง</th>
                  <th className="py-3.5 px-4">วันที่ & เวลา</th>
                  <th className="py-3.5 px-4">สถานะอนุมัติ</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-xs">
                {filteredBookings.map((b) => {
                  const room = roomMap.get(b.roomId);
                  const isCancelled = b.status === 'cancelled';
                  const isPending = b.status === 'pending';

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-stone-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isCancelled ? 'opacity-60 bg-stone-50/40 dark:bg-slate-950/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-white">
                        {room?.name || 'ห้องทั่วไป'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-800 dark:text-slate-200">{b.title}</div>
                        {b.notes && (
                          <div className="text-[11px] text-stone-400 dark:text-slate-400 truncate max-w-xs">
                            {b.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-800 dark:text-slate-200">{b.bookerName}</div>
                        <div className="text-[11px] text-stone-400 dark:text-slate-400">{b.bookerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-800 dark:text-slate-200">
                          {formatThaiDate(b.startTime)}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                          {formatTimeRange(b.startTime, b.endTime)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            รอ Admin อนุมัติ
                          </span>
                        ) : isCancelled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-slate-400 bg-stone-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-slate-700">
                            <XCircle className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                            ยกเลิกแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            อนุมัติคิวแล้ว
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Admin Action Buttons */}
                          {currentUser.role === 'admin' ? (
                            <>
                              {isPending && (
                                <button
                                  onClick={() => onUpdateBookingStatus?.(b.id, 'confirmed')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all"
                                  title="อนุมัติคิวการจองนี้"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>อนุมัติคิว</span>
                                </button>
                              )}

                              {!isCancelled && (
                                <button
                                  onClick={() => onUpdateBookingStatus?.(b.id, 'cancelled')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-stone-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 transition-all"
                                  title="ยกเลิก/ปฏิเสธคิว"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{isPending ? 'ปฏิเสธ' : 'ยกเลิกคิว'}</span>
                                </button>
                              )}
                            </>
                          ) : (
                            /* Customer Action Buttons */
                            !isCancelled && (
                              <button
                                onClick={() => onCancelBooking(b.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-stone-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 transition-all"
                                title="ยกเลิกการจองคิวของคุณ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>ยกเลิกการจอง</span>
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
