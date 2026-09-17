/** Staff dashboard password — env var preferred; fallback for local dev. */
export function resolveAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "123456";
}
