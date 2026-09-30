import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
  response.cookies.delete('reservespace_session');
  return response;
}
