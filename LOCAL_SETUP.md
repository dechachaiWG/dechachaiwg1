# 🚀 คู่มือการติดตั้งและรันระบบ ReserveSpace บนเครื่อง Local (Local Setup Guide)

คู่มือนี้สำหรับนักพัฒนาหรือผู้ใช้งานที่ต้องการนำโปรเจกต์ **ReserveSpace** ไปรันใช้งานบนเครื่องคอมพิวเตอร์ของคุณแบบ Local (`http://localhost:3000`)

---

## 📌 จุดเด่นของระบบในการรันแบบ Local (Offline-First Architecture)

1. **ทำงานได้ 100% โดยไม่ต้องพึ่งพา Cloud/Internet**:
   - ระบบใช้ฐานข้อมูลท้องถิ่น (Local JSON Database) เก็บไว้ที่ [`data/app_database.json`](file:///c:/Users/TOP/Documents/miniproject/data/app_database.json)
   - ไม่จำเป็นต้องสมัคร Supabase หรือตั้งค่า Database เซิร์ฟเวอร์ภายนอก ก็สามารถสมัครสมาชิก เข้าสู่ระบบ จองคิว และอนุมัติคิวได้ทันที
2. **มีข้อมูลเริ่มต้น (Seed Data) พร้อมใช้งานทันที**:
   - มีห้องประชุมตัวอย่าง 3 ห้อง (`Executive Boardroom A`, `Creative Innovation Lab B`, `Focus Pod C`)
   - มีบัญชีผู้ดูแลระบบ (Admin) และลูกค้าตัวอย่าง (Customer) พร้อมใช้งาน

---

## 💻 1. สิ่งที่ต้องเตรียมก่อนติดตั้ง (Prerequisites)

- **Node.js**: เวอร์ชั่น 18.x ขึ้นไป ([ดาวน์โหลด Node.js](https://nodejs.org/))
- **Package Manager**: `npm` (แถมมาพร้อม Node.js) หรือ `yarn` / `pnpm` / `bun`
- **Web Browser**: Chrome, Edge, Firefox หรือ Safari เวอร์ชั่นล่าสุด

---

## 🛠️ 2. ขั้นตอนการติดตั้งและรันระบบ (Step-by-Step Installation)

### ขั้นตอนที่ 2.1: ดาวน์โหลดหรือ Clone โปรเจกต์
เปิด Terminal / Command Prompt แล้วไปยังโฟลเดอร์ที่คุณต้องการเก็บโปรเจกต์:
```bash
git clone <repository-url>
cd miniproject
```
*(หรือแตกไฟล์ zip โปรเจกต์ แล้วเปิด Terminal ในโฟลเดอร์ `miniproject`)*

---

### ขั้นตอนที่ 2.2: ติดตั้ง Dependencies
รันคำสั่งเพื่อติดตั้ง Package ทั้งหมดที่ต้องใช้ (เช่น Next.js 15+, React 19, Tailwind CSS v4, Lucide Icons, bcryptjs, jose):
```bash
npm install
```

---

### ขั้นตอนที่ 2.3: การตั้งค่า Environment Variables (`.env.local`)
สร้างไฟล์ชื่อ `.env.local` ที่ Root Directory ของโปรเจกต์ (โฟลเดอร์เดียวกับ `package.json`):

```env
# ตั้งค่า JWT Secret สำหรับการเซ็น Cookie เข้าสู่ระบบ
JWT_SECRET=reservespace_super_secret_jwt_key_2026

# (ตัวเลือกเสริม) หากต้องการซิงค์ข้อมูลกับ Supabase Cloud ให้ใส่ URL & Key ด้านล่าง
# หากไม่ได้ใช้ Supabase สามารถปล่อยว่างไว้ได้ ระบบจะรันแบบ Local 100% อัตโนมัติ
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### ขั้นตอนที่ 2.4: สตาร์ท Dev Server
รันคำสั่งเพื่อเริ่มเซิร์ฟเวอร์จำลองสำหรับนักพัฒนา:
```bash
npm run dev
```

เมื่อขึ้นข้อความ:
```text
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
```
ให้เปิดเว็บเบราว์เซอร์ แล้วเข้าไปที่ **[http://localhost:3000](http://localhost:3000)** ทันที!

---

## 🔑 3. บัญชีผู้ใช้ตัวอย่างสำหรับทดสอบระบบ (Default Seed Accounts)

ระบบมาพร้อมกับบัญชีทดสอบเริ่มต้นที่คุณสามารถใช้ล็อกอินทดสอบได้ทันที:

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | สิทธิ์การใช้งาน |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin@reservespace.com` | `Admin@123456` | ดูคิวทั้งหมด, อนุมัติ/ปฏิเสธคิว, จัดการข้อมูลลูกค้าทั้งหมด |
| 👤 **Customer** | `somchai@reservespace.com` | `Customer@123456` | จองห้องประชุม, ดูประวัติคิวของตนเอง, แก้ไขที่อยู่ออกใบเสร็จ/Tax ID |

> 💡 **หมายเหตุ**: คุณสามารถกดปุ่ม **"ลงทะเบียน (Register)"** บนหน้าเว็บเพื่อสร้างบัญชีลูกค้าใหม่ได้เองตลอดเวลา

---

## ☁️ 4. (ตัวเลือกเสริม) การเปิดใช้ Dual-Sync ร่วมกับ Supabase Cloud

หากคุณต้องการให้ระบบซิงค์ข้อมูลคู่ขนานไปยัง **Supabase Cloud Database** เมื่อมีการเพิ่ม/แก้ไขข้อมูลในเครื่อง Local ให้ทำตามขั้นตอนดังนี้:

1. สมัครใช้งานที่ [supabase.com](https://supabase.com) แล้วสร้าง Project ใหม่
2. ไปที่ **Project Settings -> API** นำ `URL` และ `anon key` มาใส่ในไฟล์ `.env.local`
3. ไปที่เมนู **SQL Editor** ใน Supabase แล้วรันคำสั่ง SQL เพื่อสร้างโครงสร้างตาราง:

```sql
-- 1. สร้างตาราง customers
CREATE TABLE IF NOT EXISTS public.customers (
  id VARCHAR(255) PRIMARY KEY,
  customer_code VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  company VARCHAR(255),
  tax_id VARCHAR(100),
  address TEXT,
  role VARCHAR(50) DEFAULT 'customer',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. สร้างตาราง rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  amenities TEXT[],
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. สร้างตาราง bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id VARCHAR(255) PRIMARY KEY,
  room_id VARCHAR(255) REFERENCES public.rooms(id) ON DELETE CASCADE,
  customer_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  booker_name VARCHAR(255) NOT NULL,
  booker_email VARCHAR(255) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ตั้งค่า RLS Policy ให้สาธารณะอ่านและอัปเดตได้
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow public full access rooms" ON public.rooms FOR ALL USING (true);
CREATE POLICY "Allow public full access bookings" ON public.bookings FOR ALL USING (true);
```

---

## 📂 5. โครงสร้างโฟลเดอร์สำคัญของโปรเจกต์ (Project Structure)

```text
miniproject/
├── data/
│   └── app_database.json     # ฐานข้อมูลท้องถิ่นหลัก (Persisted JSON File)
├── src/
│   ├── app/                  # Next.js App Router (Page, Layout, Globals CSS)
│   │   ├── api/              # REST API Routes (/api/auth, /api/bookings, /api/customers)
│   │   ├── globals.css       # Tailwind CSS v4 Styles & Theme Variables
│   │   └── page.tsx          # Main Web Application View
│   ├── components/           # UI Components
│   │   ├── Navbar.tsx        # แถบเมนูด้านบน + ปุ่มสลับ Light/Dark Mode
│   │   ├── CalendarPicker.tsx# ปฏิทินเลือกวันที่
│   │   ├── RoomCard.tsx      # การ์ดแสดงรายละเอียดห้องประชุม
│   │   ├── TimeSlotGrid.tsx  # ตารางแสดงช่วงเวลาจอง
│   │   ├── DashboardView.tsx # สรุปการจอง และการอนุมัติคิว (Admin/Customer)
│   │   ├── CustomerManagementView.tsx # ฐานข้อมูลลูกค้า & โปรไฟล์ส่วนตัว
│   │   ├── AuthModal.tsx     # หน้าต่างเข้าสู่ระบบ / ลงทะเบียน
│   │   └── BookingModal.tsx  # หน้าต่างกรอกข้อมูลการจองห้อง
│   └── lib/                  # Utilities & Database Controllers
│       ├── db.ts             # Local JSON Database Controller
│       ├── auth.ts           # bcrypt & JWT Authentication Helpers
│       ├── dateUtils.ts      # Time Overlap Calculation Engine
│       └── supabaseClient.ts # Supabase Cloud Dual-Sync Integration
├── .env.local                # Environment Configuration
├── LOCAL_SETUP.md            # คู่มือการติดตั้งและรันแบบ Local (ไฟล์นี้)
└── package.json              # Dependencies list
```

---

## ❓ 6. คำถามที่พบบ่อย (FAQ & Troubleshooting)

### Q1: หากเผลอลบไฟล์ `data/app_database.json` จะเกิดอะไรขึ้น?
> **ตอบ**: ไม่ต้องกังวลครับ ระบบมีกลไก Auto-Initialization หากไม่พบไฟล์ `data/app_database.json` ระบบจะสร้างไฟล์ใหม่พร้อมใส่ข้อมูลตัวอย่าง (Seed Data) ให้โดยอัตโนมัติเมื่อสตาร์ทเซิร์ฟเวอร์

### Q2: ลืมรหัสผ่านบัญชี Admin หรือต้องการรีเซ็ตข้อมูลใหม่ทั้งหมด?
> **ตอบ**: สามารถลบไฟล์ `data/app_database.json` ออก แล้วรีเฟรชหน้าเว็บ รหัสผ่าน Admin จะกลับไปเป็น `Admin@123456` เหมือนเดิมครับ

### Q3: เปลี่ยนสีธีม Light/Dark Mode ตรงไหน?
> **ตอบ**: สามารถกดปุ่ม **รูปดวงอาทิตย์ ☀️ / ดวงจันทร์ 🌙** บน Navbar ทางขวามือได้เลยครับ ระบบจะจดจำค่าไว้ใน `localStorage` อัตโนมัติ

---
*ReserveSpace Local Setup Guide — เอกสารสำหรับการรันระบบบนเครื่อง Local*
