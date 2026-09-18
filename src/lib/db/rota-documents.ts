import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/db/data-dir";
import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
} from "@/lib/rota/compliance";
import type { RightToWorkDocument } from "@/lib/rota/types";
import {
  createServerClient,
  isSupabaseConfigured,
} from "../supabase/client";

const BUCKET = "rota-documents";

function documentsDir(): string {
  return path.join(getDataDir(), "rota-documents");
}

function localDocumentPath(employeeId: string): string {
  return path.join(documentsDir(), `${employeeId}.bin`);
}

function localMetaPath(employeeId: string): string {
  return path.join(documentsDir(), `${employeeId}.meta.json`);
}

function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    return "Upload a PDF or image (JPEG, PNG, WebP)";
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return "File must be 5 MB or smaller";
  }
  return null;
}

async function writeLocalDocument(
  employeeId: string,
  buffer: Buffer,
  meta: RightToWorkDocument,
): Promise<void> {
  const dir = documentsDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(localDocumentPath(employeeId), buffer);
  await fs.writeFile(localMetaPath(employeeId), JSON.stringify(meta, null, 2));
}

async function readLocalDocument(
  employeeId: string,
): Promise<{ buffer: Buffer; meta: RightToWorkDocument } | null> {
  try {
    const [buffer, metaRaw] = await Promise.all([
      fs.readFile(localDocumentPath(employeeId)),
      fs.readFile(localMetaPath(employeeId), "utf-8"),
    ]);
    return { buffer, meta: JSON.parse(metaRaw) as RightToWorkDocument };
  } catch {
    return null;
  }
}

async function deleteLocalDocument(employeeId: string): Promise<void> {
  await Promise.allSettled([
    fs.unlink(localDocumentPath(employeeId)),
    fs.unlink(localMetaPath(employeeId)),
  ]);
}

async function writeSupabaseDocument(
  employeeId: string,
  buffer: Buffer,
  meta: RightToWorkDocument,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createServerClient();
  const storagePath = `${employeeId}/right-to-work.${extensionForMime(meta.mimeType)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: meta.mimeType,
      upsert: true,
    });

  return !error;
}

async function readSupabaseDocument(
  employeeId: string,
  meta: RightToWorkDocument,
): Promise<Buffer | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerClient();
  const storagePath = `${employeeId}/right-to-work.${extensionForMime(meta.mimeType)}`;
  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

async function deleteSupabaseDocument(
  employeeId: string,
  meta: RightToWorkDocument | null,
): Promise<void> {
  if (!isSupabaseConfigured() || !meta) return;
  const supabase = createServerClient();
  const storagePath = `${employeeId}/right-to-work.${extensionForMime(meta.mimeType)}`;
  await supabase.storage.from(BUCKET).remove([storagePath]);
}

export async function saveRightToWorkDocument(
  employeeId: string,
  file: File,
): Promise<RightToWorkDocument> {
  const validation = validateUploadFile(file);
  if (validation) throw new Error(validation);

  const buffer = Buffer.from(await file.arrayBuffer());
  const meta: RightToWorkDocument = {
    fileName: file.name,
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
    sizeBytes: file.size,
  };

  await writeLocalDocument(employeeId, buffer, meta);
  await writeSupabaseDocument(employeeId, buffer, meta);
  return meta;
}

export async function readRightToWorkDocument(employeeId: string): Promise<{
  buffer: Buffer;
  meta: RightToWorkDocument;
} | null> {
  const local = await readLocalDocument(employeeId);
  if (local) return local;

  return null;
}

export async function readRightToWorkDocumentWithMeta(
  employeeId: string,
  meta: RightToWorkDocument,
): Promise<{ buffer: Buffer; meta: RightToWorkDocument } | null> {
  const local = await readLocalDocument(employeeId);
  if (local) return local;

  const remote = await readSupabaseDocument(employeeId, meta);
  if (remote) return { buffer: remote, meta };

  return null;
}

export async function deleteRightToWorkDocument(
  employeeId: string,
  meta: RightToWorkDocument | null,
): Promise<void> {
  await deleteLocalDocument(employeeId);
  await deleteSupabaseDocument(employeeId, meta);
}
