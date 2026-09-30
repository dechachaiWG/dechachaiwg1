import { NextResponse } from 'next/server';
import { findCustomerById, updateCustomer, deleteCustomer, sanitizeCustomer } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await findCustomerById(id);
    if (!customer) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลลูกค้า' }, { status: 404 });
    }
    return NextResponse.json({ customer: sanitizeCustomer(customer) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer details' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password, ...updates } = body;

    if (password && password.trim().length > 0) {
      updates.passwordHash = await hashPassword(password);
    }

    const updated = await updateCustomer(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลลูกค้า' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer: sanitizeCustomer(updated) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteCustomer(id);
    if (!deleted) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลลูกค้า' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'ลบข้อมูลลูกค้าเรียบร้อยแล้ว' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
