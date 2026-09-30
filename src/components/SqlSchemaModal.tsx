'use client';

import React, { useState } from 'react';
import { SUPABASE_SQL_SCRIPT, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Copy, Check, Database, Terminal, ShieldAlert, Sparkles } from 'lucide-react';

export const SqlSchemaModal: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-stone-900">
                Supabase Database Setup Guide
              </h2>
              {isSupabaseConfigured ? (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  เชื่อมต่อสำเร็จแล้ว
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  ยังไม่ได้ใส่ API Keys
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              ระบบออกแบบให้ทำงานร่วมกับ <strong>Supabase (PostgreSQL)</strong> ได้อย่างไร้รอยต่อ
              รวมถึงสามารถทดสอบใช้งานด้วย Local Memory State ได้ทันทีโดยไม่ต้องรอก็ได้ครับ
            </p>
          </div>
        </div>

        {/* Step-by-step instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-stone-100">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              ขั้นตอนที่ 1
            </span>
            <h3 className="text-xs font-semibold text-stone-900 mt-2">
              สร้างคัดลอก SQL Script
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">
              คัดลอกโค้ดด้านล่างไปวางใน <strong>Supabase SQL Editor</strong> เพื่อสร้างตาราง `rooms` และ `bookings`
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              ขั้นตอนที่ 2
            </span>
            <h3 className="text-xs font-semibold text-stone-900 mt-2">
              ตั้งค่า Environment Variables
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">
              สร้างไฟล์ `.env.local` ใน Root Folder ของโปรเจกต์ แล้วระบุ `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              ขั้นตอนที่ 3
            </span>
            <h3 className="text-xs font-semibold text-stone-900 mt-2">
              เปิดใช้งาน Realtime Sync
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">
              สคริปต์ด้านล่างเพิ่ม `supabase_realtime` อัตโนมัติเพื่อให้อัปเดตตารางเวลาข้ามหน้าจอแบบทันที
            </p>
          </div>
        </div>
      </div>

      {/* Code Block Container */}
      <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-sm text-stone-100">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-stone-300">
              Supabase SQL Schema Migration Script
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition-all border border-stone-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">คัดลอกสำเร็จ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>คัดลอก SQL Script</span>
              </>
            )}
          </button>
        </div>

        <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto p-3 bg-stone-950/80 rounded-xl leading-relaxed">
          {SUPABASE_SQL_SCRIPT}
        </pre>
      </div>
    </div>
  );
};
