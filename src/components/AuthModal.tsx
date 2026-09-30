'use client';

import React, { useState } from 'react';
import { AuthSessionUser } from '@/lib/types';
import { X, Lock, Mail, User, Phone, Building, FileText, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthSessionUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      setSuccessMsg('เข้าสู่ระบบสำเร็จแล้ว!');
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone,
          company,
          taxId,
          address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ลงทะเบียนไม่สำเร็จ');
      }

      setSuccessMsg('ลงทะเบียนสมาชิกและสร้างฐานข้อมูลลูกค้าเรียบร้อยแล้ว!');
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-stone-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-stone-900 to-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Lock className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Secure Access
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {tab === 'login' ? 'เข้าสู่ระบบผู้ใช้งาน' : 'ลงทะเบียนลูกค้าใหม่'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {tab === 'login'
              ? 'ระบบเข้าสู่ระบบแบบปลอดภัยด้วย bcrypt Password Encryption'
              : 'สร้างฐานข้อมูลโปรไฟล์ลูกค้าแบบครบถ้วนเพื่อใช้บริการ'}
          </p>

          {/* Toggle Tabs */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl mt-4 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              เข้าสู่ระบบ (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              ลงทะเบียน (Register)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                  อีเมล (Email Address) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                  รหัสผ่าน (Password) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500 hover:text-stone-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Sign In)'}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                  อีเมล (Email) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                  ตั้งรหัสผ่าน (Password) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณสมชาย ใจดี"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                  เบอร์โทรศัพท์ติดต่อ *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08X-XXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                    ชื่อบริษัท/องค์กร
                  </label>
                  <input
                    type="text"
                    placeholder="ระบุชื่อบริษัท"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                    เลขประจำตัวผู้เสียภาษี
                  </label>
                  <input
                    type="text"
                    placeholder="13 หลัก"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  ที่อยู่ติดต่อ / ที่อยู่ออกใบเสร็จ
                </label>
                <textarea
                  rows={2}
                  placeholder="ระบุที่อยู่เต็ม สำหรับการออกใบเสร็จหรือจัดส่งเอกสาร..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'กำลังสร้างบัญชี...' : 'ยืนยันลงทะเบียนสมาชิก'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
