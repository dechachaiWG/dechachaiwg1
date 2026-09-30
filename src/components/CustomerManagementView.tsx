'use client';

import React, { useState, useEffect } from 'react';
import { Customer, AuthSessionUser, Booking } from '@/lib/types';
import { formatThaiDate, formatTimeRange } from '@/lib/dateUtils';
import {
  Users,
  Search,
  Plus,
  Building,
  FileText,
  Phone,
  Mail,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  UserCheck,
  MapPin,
  Calendar,
  X,
  Lock,
  Save,
  RefreshCw,
  User as UserIcon,
  LogIn,
  Clock,
} from 'lucide-react';

interface CustomerManagementViewProps {
  currentUser: AuthSessionUser | null;
  onOpenAuth?: () => void;
}

export const CustomerManagementView: React.FC<CustomerManagementViewProps> = ({
  currentUser,
  onOpenAuth,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected customer for edit/detail (Admin)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Admin editing customer
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [newPassword, setNewPassword] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Customer editing their own profile
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [myProfileForm, setMyProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    company: currentUser?.company || '',
    taxId: currentUser?.taxId || '',
    address: currentUser?.address || '',
    password: '',
  });

  // Add customer form state (Admin)
  const [addForm, setAddForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    company: '',
    taxId: '',
    address: '',
    role: 'customer' as 'admin' | 'customer',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}`);
      const data = await res.json();
      if (res.ok && data.customers) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (res.ok && data.bookings) {
        const myOnly = data.bookings.filter(
          (b: Booking) =>
            b.customerId === currentUser.id ||
            b.bookerEmail.toLowerCase() === currentUser.email.toLowerCase()
        );
        setUserBookings(myOnly);
      }
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchCustomers();
    } else if (currentUser) {
      fetchMyBookings();
      setMyProfileForm({
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        company: currentUser.company || '',
        taxId: currentUser.taxId || '',
        address: currentUser.address || '',
        password: '',
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [currentUser, searchQuery, statusFilter]);

  // Handle customer updating their OWN profile
  const handleSaveMyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/customers/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: myProfileForm.fullName,
          phone: myProfileForm.phone,
          company: myProfileForm.company,
          taxId: myProfileForm.taxId,
          address: myProfileForm.address,
          password: myProfileForm.password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปเดตข้อมูลไม่สำเร็จ');

      showToast('อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว!');
      setIsProfileEditing(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Admin actions
  const handleOpenEdit = (c: Customer) => {
    setSelectedCustomer(c);
    setEditForm({
      fullName: c.fullName,
      phone: c.phone,
      company: c.company || '',
      taxId: c.taxId || '',
      address: c.address || '',
      role: c.role,
      status: c.status,
      notes: c.notes || '',
    });
    setNewPassword('');
    setIsEditModalOpen(true);
  };

  const handleSaveEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          password: newPassword ? newPassword : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'แก้ไขข้อมูลไม่สำเร็จ');

      showToast(`อัปเดตข้อมูลลูกค้า ${selectedCustomer.fullName} เรียบร้อยแล้ว`);
      setIsEditModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สร้างข้อมูลลูกค้าไม่สำเร็จ');

      showToast(`สร้างข้อมูลลูกค้าใหม่ ${addForm.fullName} สำเร็จแล้ว`);
      setIsAddModalOpen(false);
      setAddForm({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        company: '',
        taxId: '',
        address: '',
        role: 'customer',
        notes: '',
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCustomer = async (c: Customer) => {
    if (!confirm(`คุณต้องการลบข้อมูลลูกค้า "${c.fullName}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/customers/${c.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบข้อมูลไม่สำเร็จ');

      showToast(`ลบข้อมูลลูกค้า ${c.fullName} แล้ว`);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ==========================================
  // CASE 1: USER IS NOT LOGGED IN (GUEST)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-sm text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
          เข้าสู่ระบบเพื่อเข้าถึงข้อมูลสมาชิก
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 leading-relaxed mb-6">
          กรุณาเข้าสู่ระบบด้วยบัญชีสมาชิกของคุณเพื่อดูข้อมูลส่วนตัว จัดการรายละเอียดที่อยู่
          และตรวจสอบประวัติการจองห้องประชุมทั้งหมดของคุณ
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

  // ==========================================
  // CASE 2: NORMAL CUSTOMER ROLE (MY PROFILE VIEW)
  // ==========================================
  if (currentUser.role !== 'admin') {
    return (
      <div className="space-y-6">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-xl border border-stone-800 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-stone-900 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  currentUser.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    currentUser.fullName
                  )}`
                }
                alt={currentUser.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400/50 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {currentUser.customerCode}
                  </span>
                  <span className="text-xs font-medium text-stone-300">บัญชีลูกค้าสมาชิก</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mt-1">{currentUser.fullName}</h2>
                <p className="text-xs text-stone-300 mt-0.5">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={() => setIsProfileEditing(!isProfileEditing)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>{isProfileEditing ? 'ยกเลิกการแก้ไข' : 'แก้ไขข้อมูลส่วนตัว'}</span>
            </button>
          </div>
        </div>

        {/* Personal Profile Details or Edit Form */}
        {isProfileEditing ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-stone-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">แก้ไขข้อมูลส่วนตัว</h3>
              <span className="text-xs text-stone-400 dark:text-slate-400">อัปเดตข้อมูลการติดต่อและออกใบเสร็จ</span>
            </div>

            <form onSubmit={handleSaveMyProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={myProfileForm.fullName}
                  onChange={(e) => setMyProfileForm({ ...myProfileForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    required
                    value={myProfileForm.phone}
                    onChange={(e) => setMyProfileForm({ ...myProfileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">ชื่อบริษัท / หน่วยงาน</label>
                  <input
                    type="text"
                    value={myProfileForm.company}
                    onChange={(e) => setMyProfileForm({ ...myProfileForm, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                <input
                  type="text"
                  placeholder="13 หลัก"
                  value={myProfileForm.taxId}
                  onChange={(e) => setMyProfileForm({ ...myProfileForm, taxId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">ที่อยู่ติดต่อ / ที่อยู่ออกใบเสร็จ</label>
                <textarea
                  rows={2}
                  value={myProfileForm.address}
                  onChange={(e) => setMyProfileForm({ ...myProfileForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                  เปลี่ยนรหัสผ่านใหม่ (ปล่อยว่างหากไม่ต้องการเปลี่ยน)
                </label>
                <input
                  type="password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={myProfileForm.password}
                  onChange={(e) => setMyProfileForm({ ...myProfileForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลส่วนตัว</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Profile Details Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-slate-800 pb-2.5 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                ข้อมูลติดต่อส่วนตัว
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-400 dark:text-slate-400 text-[11px] block">เบอร์โทรศัพท์ติดต่อ</span>
                  <span className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                    {currentUser.phone || 'ยังไม่ได้ระบุ'}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 dark:text-slate-400 text-[11px] block">บริษัท / หน่วยงาน</span>
                  <span className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                    {currentUser.company || 'ลูกค้าทั่วไป (ส่วนบุคคล)'}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 dark:text-slate-400 text-[11px] block">เลขประจำตัวผู้เสียภาษี (Tax ID)</span>
                  <span className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5 mt-0.5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                    {currentUser.taxId || 'ไม่ได้ระบุ'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-slate-800 pb-2.5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                ที่อยู่จัดส่งเอกสาร / ออกใบเสร็จ
              </h3>

              <div className="text-xs text-stone-700 dark:text-slate-300 leading-relaxed">
                {currentUser.address ? (
                  <p className="bg-stone-50 dark:bg-slate-800 p-4 rounded-2xl border border-stone-200/60 dark:border-slate-700 font-normal text-stone-800 dark:text-slate-200">
                    {currentUser.address}
                  </p>
                ) : (
                  <div className="bg-stone-50 dark:bg-slate-800 p-6 rounded-2xl border border-stone-200/60 dark:border-slate-700 text-center text-stone-400 dark:text-slate-400">
                    ยังไม่มีข้อมูลที่อยู่จัดส่งเอกสาร กดปุ่ม "แก้ไขข้อมูลส่วนตัว" ด้านบนเพื่อเพิ่มที่อยู่ครับ
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Booking History Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-stone-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                ประวัติการจองห้องประชุมของฉัน ({userBookings.length} รายการ)
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                รายการจองคิวห้องประชุมทั้งหมดที่เชื่อมโยงกับบัญชีของคุณ
              </p>
            </div>
          </div>

          {userBookings.length === 0 ? (
            <div className="py-10 text-center text-stone-400 dark:text-slate-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium text-stone-600 dark:text-slate-400">ยังไม่มีประวัติการจองห้องประชุม</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-slate-800 text-[11px] font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider bg-stone-50/70 dark:bg-slate-800/60">
                    <th className="py-3 px-4 rounded-l-xl">หัวข้อการประชุม</th>
                    <th className="py-3 px-4">วันที่ & เวลา</th>
                    <th className="py-3 px-4">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-xs">
                  {userBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-white">{b.title}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-800 dark:text-slate-200">{formatThaiDate(b.startTime)}</div>
                        <div className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                          {formatTimeRange(b.startTime, b.endTime)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {b.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ยืนยันคิวแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500 dark:text-slate-400 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-stone-200 dark:border-slate-700">
                            <XCircle className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                            ยกเลิกแล้ว
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 3: ADMIN ROLE (FULL CUSTOMER DATABASE MANAGEMENT)
  // ==========================================
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'active').length;
  const corporateCustomers = customers.filter((c) => c.company && c.company.trim().length > 0).length;

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 dark:bg-slate-800 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-xl border border-stone-800 dark:border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Title */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
              <Shield className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              จัดการฐานข้อมูลลูกค้าทั้งหมด (Admin Access)
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
            สิทธิ์การจัดการระดับผู้ดูแลระบบ: ตรวจสอบ เพิ่ม แก้ไข และบริหารจัดการสิทธิ์บัญชีลูกค้าในระบบ
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มข้อมูลลูกค้าใหม่</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-slate-400">จำนวนลูกค้าในระบบ</span>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {totalCustomers} <span className="text-xs font-normal text-stone-500 dark:text-slate-400">ราย</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">ข้อมูลอัปเดตเรียลไทม์</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-slate-400">สถานะปกติ (Active)</span>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {activeCustomers} <span className="text-xs font-normal text-stone-500 dark:text-slate-400">บัญชี</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">พร้อมรับสิทธิ์จองคิวห้องประชุม</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-slate-400">ลูกค้าองค์กร/บริษัท</span>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {corporateCustomers} <span className="text-xs font-normal text-stone-500 dark:text-slate-400">องค์กร</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">มี Tax ID & ที่อยู่ใบเสร็จ</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-stone-200/80 dark:border-slate-800 shadow-sm">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาตาม รหัสลูกค้า / ชื่อ / อีเมล / เบอร์โทร / บริษัท / Tax ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-slate-400 font-medium">กรองสถานะ:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-medium text-stone-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">ทุกสถานะบัญชี</option>
              <option value="active">ปกติ (Active)</option>
              <option value="suspended">ระงับใช้งาน (Suspended)</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        {loading ? (
          <div className="py-12 text-center text-stone-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
            <p className="text-xs">กำลังโหลดข้อมูลลูกค้า...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-stone-600">ไม่พบรายการลูกค้าที่ตรงตามเงื่อนไข</p>
            <p className="text-xs text-stone-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดสร้างข้อมูลลูกค้าใหม่ได้ครับ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider bg-stone-50/70">
                  <th className="py-3.5 px-4 rounded-l-xl">รหัส & ข้อมูลลูกค้า</th>
                  <th className="py-3.5 px-4">การติดต่อ (Email & Phone)</th>
                  <th className="py-3.5 px-4">บริษัท / Tax ID</th>
                  <th className="py-3.5 px-4">สิทธิ์ & สถานะ</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.fullName)}`}
                          alt={c.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                            <span>{c.fullName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200/70 text-stone-700">
                              {c.customerCode}
                            </span>
                          </div>
                          {c.address && (
                            <div className="text-[11px] text-stone-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                              <span>{c.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-stone-800 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span>{c.email}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{c.phone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {c.company ? (
                        <div>
                          <div className="font-medium text-stone-800 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-stone-400" />
                            <span>{c.company}</span>
                          </div>
                          {c.taxId && (
                            <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                              Tax ID: {c.taxId}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-400 italic text-[11px]">ลูกค้าทั่วไป (ส่วนบุคคล)</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {c.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900 text-amber-400 border border-stone-800">
                            <Shield className="w-3 h-3 text-amber-400" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700">
                            Customer
                          </span>
                        )}

                        {c.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ปกติ (Active)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            ระงับใช้งาน
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
                          title="แก้ไขข้อมูลโปรไฟล์ลูกค้า"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {c.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteCustomer(c)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition-all"
                            title="ลบข้อมูลลูกค้า"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT CUSTOMER MODAL (ADMIN) */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {selectedCustomer.customerCode}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">
                  แก้ไขข้อมูลลูกค้า: {selectedCustomer.fullName}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAdmin} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">สถานะใช้งาน</label>
                  <select
                    value={editForm.status || 'active'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none"
                  >
                    <option value="active">ปกติ (Active)</option>
                    <option value="suspended">ระงับ (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อบริษัท/หน่วยงาน</label>
                  <input
                    type="text"
                    value={editForm.company || ''}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tax ID</label>
                  <input
                    type="text"
                    value={editForm.taxId || ''}
                    onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ที่อยู่ติดต่อ / ออกใบเสร็จ</label>
                <textarea
                  rows={2}
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  เปลี่ยนรหัสผ่านใหม่ (ปล่อยว่างหากไม่ต้องการเปลี่ยน)
                </label>
                <input
                  type="password"
                  placeholder="ระบุรหัสผ่านใหม่..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW CUSTOMER MODAL (ADMIN) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  New Customer Record
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">เพิ่มข้อมูลลูกค้าใหม่</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-5 overflow-y-auto space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">อีเมลผู้ใช้งาน *</label>
                <input
                  type="email"
                  required
                  placeholder="customer@company.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ตั้งรหัสผ่าน *</label>
                <input
                  type="password"
                  required
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="ชื่อ-นามสกุล ลูกค้า"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    required
                    placeholder="08X-XXX-XXXX"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">สิทธิ์การใช้งาน</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none"
                  >
                    <option value="customer">Customer (ลูกค้า)</option>
                    <option value="admin">Administrator (ผู้ดูแล)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อบริษัท/หน่วยงาน</label>
                  <input
                    type="text"
                    placeholder="ชื่อบริษัท"
                    value={addForm.company}
                    onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tax ID</label>
                  <input
                    type="text"
                    placeholder="เลขประจำตัวผู้เสียภาษี"
                    value={addForm.taxId}
                    onChange={(e) => setAddForm({ ...addForm, taxId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ที่อยู่ติดต่อ</label>
                <textarea
                  rows={2}
                  placeholder="ที่อยู่ลูกค้า..."
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างข้อมูลลูกค้า</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
