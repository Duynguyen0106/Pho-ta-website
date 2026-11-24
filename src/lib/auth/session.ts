import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { resolveAdminPassword, resolveSessionSecret } from "./config";

const SESSION_VERSION = 1;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface SessionPayload {
  v: number;
  exp: number;
  sid: string;
}

function sign(body: string): string {
  return createHmac("sha256", resolveSessionSecret())
    .update(body)
    .digest("base64url");
}

export function createAdminSessionToken(): string {
  const payload: SessionPayload = {
    v: SESSION_VERSION,
    exp: Date.now() + SESSION_TTL_MS,
    sid: randomBytes(24).toString("hex"),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.v !== SESSION_VERSION) return false;
    if (!payload.sid || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/** Compare a login password attempt (never stored in cookies). */
export function verifyAdminPassword(password: string): boolean {
  return password === resolveAdminPassword();
}