import { createClient } from '@supabase/supabase-js';
import { Booking, Room, Customer } from './types';
import { INITIAL_ROOMS } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 10
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper: Sync Room to Supabase Cloud
export async function syncRoomToSupabase(room: Room): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('rooms').upsert({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      amenities: room.amenities,
      description: room.description,
      image: room.image,
      status: room.status,
    });
    if (error) {
      console.warn('Supabase room upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase room sync failed', err);
    return false;
  }
}

// Helper: ดึงข้อมูลการจองจาก Supabase Cloud
export async function fetchBookingsFromSupabase(): Promise<Booking[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      roomId: row.room_id,
      customerId: row.customer_id,
      title: row.title,
      bookerName: row.booker_name,
      bookerEmail: row.booker_email,
      bookerPhone: row.booker_phone,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      notes: row.notes || '',
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Supabase query failed', err);
    return null;
  }
}

// Helper: ดึงข้อมูลลูกค้าจาก Supabase Cloud
export async function fetchCustomersFromSupabase(): Promise<Customer[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase customers fetch error:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      customerCode: row.customer_code,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      phone: row.phone,
      company: row.company || '',
      taxId: row.tax_id || '',
      address: row.address || '',
      role: row.role || 'customer',
      status: row.status || 'active',
      avatar: row.avatar || '',
      notes: row.notes || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
    }));
  } catch (err) {
    console.error('Supabase customers query failed', err);
    return null;
  }
}

// Sync Customer to Supabase Cloud
export async function syncCustomerToSupabase(customer: Customer): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('customers').upsert({
      id: customer.id,
      customer_code: customer.customerCode,
      email: customer.email,
      password_hash: customer.passwordHash,
      full_name: customer.fullName,
      phone: customer.phone,
      company: customer.company,
      tax_id: customer.taxId,
      address: customer.address,
      role: customer.role,
      status: customer.status,
      avatar: customer.avatar,
      notes: customer.notes,
      updated_at: new Date().toISOString(),
      last_login_at: customer.lastLoginAt,
    });

    if (error) {
      console.warn('Supabase customer upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase customer sync failed', err);
    return false;
  }
}

// Sync Booking to Supabase Cloud
export async function syncBookingToSupabase(booking: Booking): Promise<boolean> {
  if (!supabase) return false;
  try {
    // 1. Ensure Room exists in Supabase Cloud rooms table
    const roomObj = INITIAL_ROOMS.find((r) => r.id === booking.roomId);
    if (roomObj) {
      await syncRoomToSupabase(roomObj);
    }

    // 2. Insert/Upsert Booking record
    const { error } = await supabase.from('bookings').upsert({
      id: booking.id,
      room_id: booking.roomId,
      customer_id: booking.customerId || null,
      title: booking.title,
      booker_name: booking.bookerName,
      booker_email: booking.bookerEmail,
      booker_phone: booking.bookerPhone || null,
      start_time: booking.startTime,
      end_time: booking.endTime,
      status: booking.status,
      notes: booking.notes || '',
    });

    if (error) {
      console.warn('Supabase booking upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase booking sync failed', err);
    return false;
  }
}

export const SUPABASE_SQL_SCRIPT = `-- SQL Script สำหรับสร้าง Database, Tables และ Seed Data ใน Supabase Cloud (Idempotent Safe)

-- ลบตารางเดิมกรณีชนิดข้อมูลเดิมเป็น UUID เพื่อรีเซ็ตเป็น VARCHAR(255)
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- 1. สร้างตารางเก็บข้อมูลลูกค้า (customers)
CREATE TABLE IF NOT EXISTS public.customers (
  id VARCHAR(255) PRIMARY KEY,
  customer_code VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  company VARCHAR(255),
  tax_id VARCHAR(100),
  address TEXT,
  role VARCHAR(50) DEFAULT 'customer',
  status VARCHAR(50) DEFAULT 'active',
  avatar TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 2. สร้างตารางเก็บข้อมูลห้องประชุม (rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  location VARCHAR(255),
  amenities TEXT[] DEFAULT '{}',
  description TEXT,
  image TEXT,
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. เพิ่มข้อมูลห้องประชุมทั้ง 4 ห้องลงตาราง rooms (Seed Default Rooms)
INSERT INTO public.rooms (id, name, capacity, location, description, image, status) VALUES
  ('room-1', 'Executive Boardroom A', 12, 'ชั้น 4, ฝั่งตะวันออก', 'ห้องประชุมขนาดใหญ่ เหมาะสำหรับการประชุมผู้บริหาร การนำเสนอขายงาน หรือสัมมนาทีมใหญ่', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', 'available'),
  ('room-2', 'Creative Brainstorming Pod', 6, 'ชั้น 3, ฝั่ง Creative Hub', 'บรรยากาศสบายๆ กระตุ้นความคิดสร้างสรรค์ เหมาะสำหรับทีม Product, Design หรือ Sprint Planning', 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80', 'available'),
  ('room-3', 'Quiet Focus Studio B', 4, 'ชั้น 2, Quiet Zone', 'ห้องเงียบสงบกันเสียงรบกวน 100% เหมาะสัมภาษณ์งาน คุยกับลูกค้าสำคัญ หรือประชุมทางไกล', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 'available'),
  ('room-4', 'Townhall & Workshop Hall', 30, 'ชั้น 1, Main Lobby', 'พื้นที่อเนกประสงค์ขนาดใหญ่สำหรับจัดอบรม All-Hands Meeting หรือเปิดตัวผลิตภัณฑ์', 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80', 'available')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  location = EXCLUDED.location,
  description = EXCLUDED.description;

-- 4. สร้างตารางเก็บข้อมูลรายการจอง (bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  id VARCHAR(255) PRIMARY KEY,
  room_id VARCHAR(255) REFERENCES public.rooms(id) ON DELETE CASCADE,
  customer_id VARCHAR(255) REFERENCES public.customers(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  booker_name VARCHAR(255) NOT NULL,
  booker_email VARCHAR(255) NOT NULL,
  booker_phone VARCHAR(100),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_valid_time_range CHECK (end_time > start_time)
);

-- 5. เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ลบนโยบายเดิมก่อนสร้างใหม่ (ป้องกัน Error 42710)
DROP POLICY IF EXISTS "Allow public read customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public update customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public delete bookings" ON public.bookings;

-- 6. สร้างนโยบายการเข้าถึงข้อมูลใหม่อย่างปลอดภัย
CREATE POLICY "Allow public read customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Allow public read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete bookings" ON public.bookings FOR DELETE USING (true);
`;
