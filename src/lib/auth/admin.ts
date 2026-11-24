import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "./session";

export const COOKIE_NAME = "pho_ta_admin_session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return verifyAdminSessionToken(session?.value);
}