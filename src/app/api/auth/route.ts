import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { role, password } = await req.json();

  const adminPw = process.env.ADMIN_PASSWORD || 'admin123';
  const devPw = process.env.DEV_PASSWORD || 'dev123';

  if (role === 'admin' && password === adminPw) {
    return NextResponse.json({ ok: true });
  }
  if (role === 'dev' && password === devPw) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
