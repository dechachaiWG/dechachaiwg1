'use client';

import React from 'react';
import { Calendar, LayoutDashboard, Users, Clock, LogIn, LogOut, Shield, User, Sun, Moon } from 'lucide-react';
import { AuthSessionUser } from '@/lib/types';

interface NavbarProps {
  activeTab: 'booking' | 'dashboard' | 'customers';
  setActiveTab: (tab: 'booking' | 'dashboard' | 'customers') => void;
  bookingCountToday: number;
  currentUser: AuthSessionUser | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bookingCountToday,
  currentUser,
  theme,
  toggleTheme,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="font-semibold text-stone-900 dark:text-white text-base sm:text-lg tracking-tight truncate">
                    ReserveSpace
                  </h1>
                  <span className="hidden xs:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-slate-800 text-stone-700 dark:text-slate-300 flex-shrink-0">
                    ระบบจอง & คิว
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-slate-400 truncate hidden sm:block">
                  จัดการเวลาอย่างลงตัว ไม่ชนคิว ไม่ซ้อนทับ
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-1 bg-stone-200/60 dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('booking')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'booking'
                    ? 'bg-white dark:bg-slate-700 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/40 dark:hover:bg-slate-700/50'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>ตารางจองห้อง</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-700 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/40 dark:hover:bg-slate-700/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-stone-600 dark:text-slate-400" />
                <span>สรุปการจอง</span>
                {bookingCountToday > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center">
                    {bookingCountToday}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'customers'
                    ? 'bg-white dark:bg-slate-700 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/40 dark:hover:bg-slate-700/50'
                }`}
              >
                {currentUser?.role === 'admin' ? (
                  <>
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>จัดการฐานข้อมูลลูกค้า</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>{currentUser ? 'ข้อมูลส่วนตัวของฉัน' : 'ข้อมูลสมาชิก'}</span>
                  </>
                )}
              </button>
            </nav>

            {/* Right Section: Theme Toggle & User Auth */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-stone-200/70 dark:bg-slate-800 text-stone-700 dark:text-amber-400 hover:bg-stone-300 dark:hover:bg-slate-700 transition-all border border-stone-300/50 dark:border-slate-700 flex-shrink-0"
                title={theme === 'light' ? 'สลับเป็นโหมดมืด (Dark Mode)' : 'สลับเป็นโหมดสว่าง (Light Mode)'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* User Auth Section */}
              {currentUser ? (
                <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-2xl border border-stone-200/80 dark:border-slate-700 shadow-sm">
                  <img
                    src={
                      currentUser.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        currentUser.fullName
                      )}`
                    }
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-slate-700 flex-shrink-0"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-stone-900 dark:text-white flex items-center gap-1">
                      <span className="truncate max-w-[100px]">{currentUser.fullName}</span>
                      {currentUser.role === 'admin' && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 dark:text-slate-400 truncate max-w-[120px]">
                      {currentUser.email}
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all ml-0.5 sm:ml-1"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden xs:inline">เข้าสู่ระบบ / ลงทะเบียน</span>
                  <span className="xs:hidden">เข้าสู่ระบบ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('booking')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'booking'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">ตารางจอง</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'dashboard'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            {bookingCountToday > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                {bookingCountToday}
              </span>
            )}
          </div>
          <span className="text-[11px]">สรุปการจอง</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'customers'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          {currentUser?.role === 'admin' ? (
            <Shield className="w-5 h-5 mb-0.5 text-amber-600 dark:text-amber-400" />
          ) : (
            <User className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[11px]">
            {currentUser?.role === 'admin' ? 'ข้อมูลลูกค้า' : currentUser ? 'โปรไฟล์' : 'สมาชิก'}
          </span>
        </button>
      </nav>
    </>
  );
};

