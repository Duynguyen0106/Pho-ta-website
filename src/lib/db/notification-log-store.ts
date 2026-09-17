import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getDataDir } from "./data-dir";
import {
  createServerClient,
  isSupabaseConfigured,
} from "../supabase/client";

export type NotificationChannel = "email" | "sms";
export type NotificationType =
  | "confirmation"
  | "reminder"
  | "cancellation"
  | "staff";
export type NotificationStatus = "sent" | "failed" | "skipped";

export interface NotificationLogEntry {
  id: string;
  bookingId?: string;
  referenceCode?: string;
  channel: NotificationChannel;
  type: NotificationType;
  recipient: string;
  status: NotificationStatus;
  error?: string;
  createdAt: string;
}

function logFile(): string {
  return path.join(getDataDir(), "notification-log.json");
}

let cache: NotificationLogEntry[] | null = null;

function mapRow(row: Record<string, unknown>): NotificationLogEntry {
  return {
    id: row.id as string,
    bookingId: (row.booking_id as string) || undefined,
    referenceCode: (row.reference_code as string) || undefined,
    channel: row.channel as NotificationChannel,
    type: row.type as NotificationType,
    recipient: row.recipient as string,
    status: row.status as NotificationStatus,
    error: (row.error_message as string) || undefined,
    createdAt: row.created_at as string,
  };
}

async function readLocal(): Promise<NotificationLogEntry[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(logFile(), "utf-8");
    cache = JSON.parse(raw) as NotificationLogEntry[];
  } catch {
    cache = [];
  }
  return cache;
}

async function writeLocal(entries: NotificationLogEntry[]): Promise<void> {
  cache = entries.slice(0, 500);
  const dataDir = getDataDir();
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(logFile(), JSON.stringify(cache, null, 2));
}

export async function logNotification(input: {
  bookingId?: string;
  referenceCode?: string;
  channel: NotificationChannel;
  type: NotificationType;
  recipient: string;
  status: NotificationStatus;
  error?: string;
}): Promise<void> {
  const entry: NotificationLogEntry = {
    id: randomUUID(),
    bookingId: input.bookingId,
    referenceCode: input.referenceCode,
    channel: input.channel,
    type: input.type,
    recipient: input.recipient,
    status: input.status,
    error: input.error,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { error } = await supabase.from("notification_log").insert({
      booking_id: input.bookingId ?? null,
      reference_code: input.referenceCode ?? null,
      channel: input.channel,
      type: input.type,
      recipient: input.recipient,
      status: input.status,
      error_message: input.error ?? null,
    });

    if (error) {
      if (error.message.includes("notification_log") || error.code === "PGRST205") {
        const local = await readLocal();
        local.unshift(entry);
        await writeLocal(local);
      }
      return;
    }
    return;
  }

  const local = await readLocal();
  local.unshift(entry);
  await writeLocal(local);
}

export async function listNotificationLog(limit = 100): Promise<NotificationLogEntry[]> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("notification_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (error.message.includes("notification_log") || error.code === "PGRST205") {
        return (await readLocal()).slice(0, limit);
      }
      throw new Error(error.message);
    }
    return (data ?? []).map(mapRow);
  }

  return (await readLocal()).slice(0, limit);
}
