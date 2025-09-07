// // src/app/api/auth/register/route.ts
// -----------------------------------------------------------------------------
// Secure user‑registration endpoint for Next.js (App Router, v14+) using Prisma.
// -----------------------------------------------------------------------------
// 🔐  Key protections
//  – JSON‑only (rejects other content‑types)
//  – Zod validation + early return on failure
//  – Bcrypt hashing (12 rounds) – configurable via env
//  – Duplicate‑email guard
//  – Simple in‑memory rate‑limit (per‑IP) †
//      † Replace with Redis or Edge Durable Object in prod for multi‑instance.
// -----------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../../../../src/lib/prisma";

// -----------------------------
// 1. Validation schema
// -----------------------------
const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Định dạng email chưa hợp lệ" }),
    password: z
      .string()
      .min(8, { message: "Mật khẩu phải ≥ 8 ký tự" })
      .max(72, { message: "Mật khẩu quá dài" })
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "Mật khẩu phải chứa chữ hoa, chữ thường & số",
      }),
    name: z.string().trim().min(2).max(50),
  })
  .strict();

// -----------------------------
// 2. Basic per‑IP rate limiter
// -----------------------------
//    (30 requests / 30 min). Replace for production.
// -----------------------------
const WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const MAX_REQS = 30;
const hits = new Map<string, { count: number; ts: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return false;
  }
  entry.count += 1;
  if (entry.count > MAX_REQS) return true;
  return false;
}

// -----------------------------
// 3. POST handler
// -----------------------------
export async function POST(req: NextRequest) {
  // 3.1 Only allow JSON
  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Content‑Type phải là application/json" },
      { status: 415 }
    );
  }

  // 3.2 Rate‑limit per IP (IPv6‑safe)
  const ip = req.ip ?? "unknown";
  if (rateLimit(ip)) {
    return NextResponse.json({ error: "Quá nhiều yêu cầu, thử lại sau" }, {
      status: 429,
    });
  }

  // 3.3 Parse body & validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }

  const parse = registerSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ errors: parse.error.flatten().fieldErrors }, {
      status: 422,
    });
  }
  const { email, password, name } = parse.data;

  // 3.4 Ensure email unique
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 });
  }

  // 3.5 Hash password
  const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3.6 Persist user
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      name,
      createdAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // 3.7 Return user (sans password)
  return NextResponse.json({ user }, { status: 201 });
}

// -----------------------------
// 4. (Optional) Disable caching
// -----------------------------
export const revalidate = 0; // No static caching for this route

// -----------------------------------------------------------------------------
// 5. How to test (example using fetch in browser console):
// -----------------------------------------------------------------------------
// fetch("/api/auth/register", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     email: "test@example.com",
//     password: "MySecureP@ssw0rd",
//     name: "Tester",
//   }),
// }).then(r => r.json()).then(console.log);
// -----------------------------------------------------------------------------
// © 2025 — Adapt & extend as needed. Stay safe! ✨
