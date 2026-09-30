export type RoomStatus = 'available' | 'maintenance' | 'occupied';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
  description: string;
  image: string;
  status: RoomStatus;
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Booking {
  id: string;
  roomId: string;
  customerId?: string;
  title: string;
  bookerName: string;
  bookerEmail: string;
  bookerPhone?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'customer';
export type AccountStatus = 'active' | 'suspended';

export interface Customer {
  id: string;
  customerCode: string;
  email: string;
  passwordHash?: string;
  fullName: string;
  phone: string;
  company?: string;
  taxId?: string;
  address?: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthSessionUser {
  id: string;
  customerCode: string;
  email: string;
  fullName: string;
  phone: string;
  company?: string;
  taxId?: string;
  address?: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
}

export interface TimeSlot {
  timeLabel: string;        // e.g. "09:00 - 09:30"
  startTime: string;        // ISO string
  endTime: string;          // ISO string
  isAvailable: boolean;
  isPast: boolean;
  booking?: Booking;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  message: string;
}

