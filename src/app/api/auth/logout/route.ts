import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
// import { SignJWT } from 'jose';
import { SignJWT } from 'jose/jwt/sign';
import { prisma } from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Email không hợp lệ' }),
  password: z.string(),
}).strict();

const WINDOW = 15 * 60 * 1000;
const MAX = 20;
const bucket = new Map<string, { c: number; t: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const e = bucket.get(ip);
  if (!e || now - e.t > WINDOW) {
    bucket.set(ip, { c: 1, t: now });
    return false;
  }
  e.c += 1;
  if (e.c > MAX) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get('content-type') !== 'application/json') {
      return NextResponse.json({ error: 'Content‑Type phải là application/json' }, { status: 415 });
    }

    const ip = req.ip ?? 'unknown';
    if (limited(ip)) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu, thử lại sau' }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'JSON không hợp lệ' }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev_secret');
    const token = await new SignJWT({ sub: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(secret);

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const revalidate = 0;