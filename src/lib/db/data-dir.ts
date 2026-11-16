import path from "path";

/** Writable directory for local JSON fallback (dev / serverless without Supabase). */
export function getDataDir(): string {
  if (process.env.PHO_TA_DATA_DIR) {
    return process.env.PHO_TA_DATA_DIR;
  }

  // Serverless runtimes only allow writes under /tmp
  if (
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.CF_PAGES === "1" ||
    process.env.PHO_TA_SERVERLESS === "1"
  ) {
    return path.join("/tmp", "pho-ta-data");
  }

  return path.join(process.cwd(), ".data");
}

export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.CF_PAGES === "1" ||
      process.env.PHO_TA_SERVERLESS === "1",
  );
}
