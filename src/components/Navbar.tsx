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
    <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-stone-900 dark:text-white text-lg tracking-tight">
                  ReserveSpace
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-slate-800 text-stone-700 dark:text-slate-300">
                  ระบบจองห้องประชุม & คิว
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                จัดการเวลาอย่างลงตัว ไม่ชนคิว ไม่ซ้อนทับ
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-stone-200/60 dark:bg-slate-800/80 p-1 rounded-xl">
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
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-stone-200/70 dark:bg-slate-800 text-stone-700 dark:text-amber-400 hover:bg-stone-300 dark:hover:bg-slate-700 transition-all border border-stone-300/50 dark:border-slate-700"
              title={theme === 'light' ? 'สลับเป็นโหมดมืด (Dark Mode)' : 'สลับเป็นโหมดสว่าง (Light Mode)'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* User Auth Section */}
            {currentUser ? (
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-stone-200/80 dark:border-slate-700 shadow-sm">
                <img
                  src={
                    currentUser.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      currentUser.fullName
                    )}`
                  }
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-slate-700"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-stone-900 dark:text-white flex items-center gap-1">
                    <span>{currentUser.fullName}</span>
                    {currentUser.role === 'admin' && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 dark:text-slate-400">{currentUser.email}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all ml-1"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ / ลงทะเบียน</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

