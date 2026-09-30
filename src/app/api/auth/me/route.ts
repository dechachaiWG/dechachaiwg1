import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { findCustomerById, sanitizeCustomer } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('reservespace_session')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifySessionToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ user: null });
    }

    const customer = await findCustomerById(payload.id);
    if (!customer || customer.status === 'suspended') {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: sanitizeCustomer(customer) });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
