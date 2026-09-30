import { NextResponse } from 'next/server';
import { getCustomers, createCustomer, findCustomerByEmail, sanitizeCustomer } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const status = searchParams.get('status');

    let customers = await getCustomers();

    if (query) {
      customers = customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.customerCode.toLowerCase().includes(query) ||
          (c.company && c.company.toLowerCase().includes(query)) ||
          (c.taxId && c.taxId.includes(query))
      );
    }

    if (status && status !== 'all') {
      customers = customers.filter((c) => c.status === status);
    }

    const safeCustomers = customers.map(sanitizeCustomer);
    return NextResponse.json({ customers: safeCustomers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, company, taxId, address, role, status, notes } = body;

    if (!email || !fullName || !phone) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็น (อีเมล, ชื่อ-นามสกุล, เบอร์โทร) ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const existing = await findCustomerByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'อีเมลนี้มีอยู่ในระบบแล้ว' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password || 'Customer@123456');

    const newCustomer = await createCustomer({
      email,
      passwordHash,
      fullName,
      phone,
      company: company || '',
      taxId: taxId || '',
      address: address || '',
      role: role || 'customer',
      status: status || 'active',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      notes: notes || '',
    });

    return NextResponse.json({ success: true, customer: sanitizeCustomer(newCustomer) });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
