import fs from 'fs';
import path from 'path';
import { Customer, Room, Booking, AuthSessionUser, BookingStatus } from './types';
import { hashPassword } from './auth';
import { INITIAL_ROOMS, INITIAL_BOOKINGS } from './mockData';
import {
  isSupabaseConfigured,
  syncCustomerToSupabase,
  syncBookingToSupabase,
} from './supabaseClient';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'app_database.json');

interface DatabaseSchema {
  rooms: Room[];
  customers: Customer[];
  bookings: Booking[];
}

let isInitialized = false;

// Ensure database directory & JSON file exist with default seeded data
export async function getDatabase(): Promise<DatabaseSchema> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    // Generate pre-seeded bcrypt password hashes for default users
    const adminPasswordHash = await hashPassword('Admin@123456');
    const customerPasswordHash = await hashPassword('Customer@123456');

    const seedCustomers: Customer[] = [
      {
        id: 'cust-admin-01',
        customerCode: 'CUST-1000',
        email: 'admin@reservespace.com',
        passwordHash: adminPasswordHash,
        fullName: 'ผู้ดูแลระบบ (Admin)',
        phone: '081-999-8888',
        company: 'ReserveSpace HQ Co., Ltd.',
        taxId: '0105566001122',
        address: '99 อาคารสำนักงานใหญ่ ชั้น 15 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ 10110',
        role: 'admin',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        notes: 'บัญชีผู้ดูแลระบบหลักสำหรับจัดการข้อมูลลูกค้าและการจองห้องประชุม',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cust-user-01',
        customerCode: 'CUST-1001',
        email: 'somchai@reservespace.com',
        passwordHash: customerPasswordHash,
        fullName: 'คุณสมชาย ใจดี',
        phone: '082-123-4567',
        company: 'บริษัท เอ็กซ์เพิร์ท โซลูชั่นส์ จำกัด',
        taxId: '0105559876543',
        address: '123/45 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
        role: 'customer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        notes: 'ลูกค้าองค์กร VIP ประจำแผนกไอที',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cust-user-02',
        customerCode: 'CUST-1002',
        email: 'wichai@company.co.th',
        passwordHash: await hashPassword('Customer@123456'),
        fullName: 'คุณวิชัย เจริญผล',
        phone: '089-876-5432',
        company: 'นวัตกรรมสร้างสรรค์ จำกัด',
        taxId: '0105544332211',
        address: '88/9 ถ.พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
        role: 'customer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        notes: 'ลูกค้าประเภทพาร์ทเนอร์รายปี',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const initialDb: DatabaseSchema = {
      rooms: INITIAL_ROOMS,
      customers: seedCustomers,
      bookings: INITIAL_BOOKINGS.map((b) => ({
        ...b,
        customerId: b.bookerEmail === 'somchai@reservespace.com' ? 'cust-user-01' : 'cust-user-02',
        bookerPhone: '082-123-4567',
      })),
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data: DatabaseSchema = JSON.parse(raw);
    return data;
  } catch (err) {
    console.error('Error reading DB file, recreating default DB:', err);
    fs.rmSync(DB_FILE, { force: true });
    return getDatabase();
  }
}

// Save state to JSON file safely
export async function saveDatabase(data: DatabaseSchema): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Customer DB queries
export async function getCustomers(): Promise<Customer[]> {
  const db = await getDatabase();
  return db.customers;
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const customers = await getCustomers();
  return customers.find((c) => c.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  const customers = await getCustomers();
  return customers.find((c) => c.id === id) || null;
}

export async function createCustomer(customerData: Omit<Customer, 'id' | 'customerCode' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
  const db = await getDatabase();
  const nextNumber = db.customers.length + 1000;
  const newCustomer: Customer = {
    ...customerData,
    id: `cust-${Date.now()}`,
    customerCode: `CUST-${nextNumber}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.customers.unshift(newCustomer);
  await saveDatabase(db);

  if (isSupabaseConfigured) {
    syncCustomerToSupabase(newCustomer).catch((e) =>
      console.warn('Background Supabase customer sync failed:', e)
    );
  }

  return newCustomer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const db = await getDatabase();
  const index = db.customers.findIndex((c) => c.id === id);
  if (index === -1) return null;

  db.customers[index] = {
    ...db.customers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveDatabase(db);

  if (isSupabaseConfigured) {
    syncCustomerToSupabase(db.customers[index]).catch((e) =>
      console.warn('Background Supabase customer update sync failed:', e)
    );
  }

  return db.customers[index];
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const db = await getDatabase();
  const initialLength = db.customers.length;
  db.customers = db.customers.filter((c) => c.id !== id);
  
  if (db.customers.length !== initialLength) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// Helper: Strip sensitive info like passwordHash for client delivery
export function sanitizeCustomer(customer: Customer): AuthSessionUser {
  const { passwordHash, notes, ...safeUser } = customer;
  return safeUser;
}

// Booking DB queries
export async function getBookings(): Promise<Booking[]> {
  const db = await getDatabase();
  return db.bookings;
}

export async function createBookingInDb(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  const db = await getDatabase();

  // Find or auto-create customer record in database
  let targetCustomerId = bookingData.customerId;
  if (!targetCustomerId && bookingData.bookerEmail) {
    const existing = db.customers.find(
      (c) => c.email.toLowerCase() === bookingData.bookerEmail.toLowerCase()
    );
    if (existing) {
      targetCustomerId = existing.id;
    } else {
      // Auto-create customer record in Customer Database
      const nextNumber = db.customers.length + 1000;
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        customerCode: `CUST-${nextNumber}`,
        email: bookingData.bookerEmail,
        fullName: bookingData.bookerName,
        phone: bookingData.bookerPhone || '080-000-0000',
        company: '',
        taxId: '',
        address: '',
        role: 'customer',
        status: 'active',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          bookingData.bookerName
        )}`,
        notes: 'สร้างจากรายการจองห้องประชุมอัตโนมัติ',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.customers.unshift(newCust);
      targetCustomerId = newCust.id;

      if (isSupabaseConfigured) {
        syncCustomerToSupabase(newCust).catch((e) =>
          console.warn('Background Supabase customer auto-create sync failed:', e)
        );
      }
    }
  }

  const newBooking: Booking = {
    ...bookingData,
    customerId: targetCustomerId,
    id: `b-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);
  await saveDatabase(db);

  if (isSupabaseConfigured) {
    syncBookingToSupabase(newBooking).catch((e) =>
      console.warn('Background Supabase booking create sync failed:', e)
    );
  }

  return newBooking;
}

export async function updateBookingStatusInDb(
  bookingId: string,
  status: BookingStatus
): Promise<boolean> {
  const db = await getDatabase();
  const booking = db.bookings.find((b) => b.id === bookingId);
  if (booking) {
    booking.status = status;
    await saveDatabase(db);

    if (isSupabaseConfigured) {
      syncBookingToSupabase(booking).catch((e) =>
        console.warn('Background Supabase booking status sync failed:', e)
      );
    }

    return true;
  }
  return false;
}

export async function cancelBookingInDb(bookingId: string): Promise<boolean> {
  return updateBookingStatusInDb(bookingId, 'cancelled');
}

