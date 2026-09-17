import { cookies } from "next/headers";
import { ADMIN_PASSWORD } from "./config";

const COOKIE_NAME = "pho_ta_admin_session";

export function getAdminPassword(): string {
  return ADMIN_PASSWORD;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return session?.value === getAdminPassword();
}

export { COOKIE_NAME };
