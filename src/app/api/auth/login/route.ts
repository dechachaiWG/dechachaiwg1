import { NextResponse } from 'next/server';
import { findCustomerByEmail, sanitizeCustomer, updateCustomer } from '@/lib/db';
import { comparePassword, createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const customer = await findCustomerByEmail(email);
    if (!customer || !customer.passwordHash) {
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    if (customer.status === 'suspended') {
      return NextResponse.json(
        { error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, customer.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await updateCustomer(customer.id, { lastLoginAt: new Date().toISOString() });

    const safeUser = sanitizeCustomer(customer);
    const token = await createSessionToken(safeUser);

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: safeUser,
      token,
    });

    // Set HTTP-only cookie for secure sessions
    response.cookies.set({
      name: 'reservespace_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
