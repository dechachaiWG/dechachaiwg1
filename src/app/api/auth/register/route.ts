import { NextResponse } from 'next/server';
import { findCustomerByEmail, createCustomer, sanitizeCustomer } from '@/lib/db';
import { hashPassword, createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, company, taxId, address } = body;

    if (!email || !password || !fullName || !phone) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็น (อีเมล, รหัสผ่าน, ชื่อ-นามสกุล, เบอร์โทร) ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    const existingUser = await findCustomerByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกลงทะเบียนไว้ในระบบเรียบร้อยแล้ว' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newCustomer = await createCustomer({
      email,
      passwordHash,
      fullName,
      phone,
      company: company || '',
      taxId: taxId || '',
      address: address || '',
      role: 'customer',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      notes: 'ลงทะเบียนผ่านหน้าเว็บ',
    });

    const safeUser = sanitizeCustomer(newCustomer);
    const token = await createSessionToken(safeUser);

    const response = NextResponse.json({
      success: true,
      message: 'ลงทะเบียนสำเร็จเรียบร้อยแล้ว',
      user: safeUser,
      token,
    });

    response.cookies.set({
      name: 'reservespace_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลงทะเบียน' },
      { status: 500 }
    );
  }
}
