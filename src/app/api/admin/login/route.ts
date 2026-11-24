import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/admin";
import { resolveAdminPassword } from "@/lib/auth/config";
import {
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/auth/session";
import {
  checkRateLimit,
  clientIpFromRequest,
} from "@/lib/rate-limit";

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request);
  const limit = checkRateLimit(`admin-login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Too many login attempts. Try again in ${limit.retryAfterSec ?? 60} seconds.`,
      },
      { status: 429 },
    );
  }

  let password: string;
  try {
    const body = await request.json();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    resolveAdminPassword();
  } catch (configError) {
    console.error("[admin/login:config]", configError);
    return NextResponse.json(
      { error: "Admin login is not configured. Contact the site owner." },
      { status: 503 },
    );
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  let sessionToken: string;
  try {
    sessionToken = createAdminSessionToken();
  } catch (sessionError) {
    console.error("[admin/login:session]", sessionError);
    return NextResponse.json(
      { error: "Admin login is not configured. Contact the site owner." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}