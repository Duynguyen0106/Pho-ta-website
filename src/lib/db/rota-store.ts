import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { listBlackoutDates } from "@/lib/db/blackout-store";
import { getDataDir } from "@/lib/db/data-dir";
import { generateMonthlyRota, validateEmployeeInput } from "@/lib/rota/generate-schedule";
import {
  FULL_TIME_WEEKLY_HOURS,
  type EmploymentType,
  type RotaEmployee,
  type RotaSettingsData,
  type RotaShift,
} from "@/lib/rota/types";
import {
  createServerClient,
  isSupabaseConfigured,
} from "../supabase/client";

function rotaFile(): string {
  return path.join(getDataDir(), "rota.json");
}

let cache: RotaSettingsData | null = null;

function emptyData(): RotaSettingsData {
  return { employees: [], monthlySchedules: {} };
}

function normalizeRotaData(raw: unknown): RotaSettingsData {
  if (!raw || typeof raw !== "object") return emptyData();
  const obj = raw as Record<string, unknown>;

  if (obj.monthlySchedules && typeof obj.monthlySchedules === "object") {
    return {
      employees: (obj.employees as RotaEmployee[]) ?? [],
      monthlySchedules: obj.monthlySchedules as Record<string, RotaShift[]>,
    };
  }

  const employees = (obj.employees as RotaEmployee[]) ?? [];
  const shifts = (obj.shifts as RotaShift[]) ?? [];
  const monthlySchedules: Record<string, RotaShift[]> = {};
  for (const shift of shifts) {
    if (!monthlySchedules[shift.monthKey]) {
      monthlySchedules[shift.monthKey] = [];
    }
    monthlySchedules[shift.monthKey].push(shift);
  }
  return { employees, monthlySchedules };
}

function useSupabase(): boolean {
  return isSupabaseConfigured();
}

function getSupabase() {
  return createServerClient();
}

async function readLocal(): Promise<RotaSettingsData> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(rotaFile(), "utf-8");
    cache = normalizeRotaData(JSON.parse(raw));
  } catch {
    cache = emptyData();
  }
  return cache;
}

async function writeLocal(data: RotaSettingsData): Promise<void> {
  cache = data;
  const dataDir = getDataDir();
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(rotaFile(), JSON.stringify(data, null, 2));
}

async function readSupabase(): Promise<RotaSettingsData | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("rota_settings")
    .select("data")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    if (error.message.includes("rota_settings") || error.code === "PGRST205") {
      return null;
    }
    throw new Error(error.message);
  }

  if (!data?.data) return null;
  return normalizeRotaData(data.data);
}

async function writeSupabase(data: RotaSettingsData): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("rota_settings").upsert({
    id: "default",
    data,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (error.message.includes("rota_settings") || error.code === "PGRST205") {
      await writeLocal(data);
      return;
    }
    throw new Error(error.message);
  }
}

async function getData(): Promise<RotaSettingsData> {
  if (useSupabase()) {
    const remote = await readSupabase();
    if (remote) {
      cache = remote;
      await writeLocal(remote);
      return remote;
    }
  }
  return readLocal();
}

async function persist(data: RotaSettingsData): Promise<void> {
  cache = data;
  await writeLocal(data);
  if (useSupabase()) {
    try {
      await writeSupabase(data);
    } catch {
      /* local copy retained */
    }
  }
}

function shiftsForMonth(data: RotaSettingsData, monthKey: string): RotaShift[] {
  return (data.monthlySchedules[monthKey] ?? []).sort((a, b) =>
    a.shiftDate === b.shiftDate
      ? a.startTime.localeCompare(b.startTime)
      : a.shiftDate.localeCompare(b.shiftDate),
  );
}

export async function listRotaEmployees(): Promise<RotaEmployee[]> {
  const data = await getData();
  return [...data.employees].sort((a, b) => a.name.localeCompare(b.name));
}

export async function listRotaShifts(monthKey: string): Promise<RotaShift[]> {
  const data = await getData();
  return shiftsForMonth(data, monthKey);
}

export async function getRotaForMonth(monthKey: string): Promise<{
  employees: RotaEmployee[];
  shifts: RotaShift[];
}> {
  const data = await getData();
  return {
    employees: data.employees,
    shifts: shiftsForMonth(data, monthKey),
  };
}

export async function createRotaEmployee(input: {
  name: string;
  employmentType: EmploymentType;
  requestedHoursPerWeek: number;
}): Promise<RotaEmployee> {
  const validation = validateEmployeeInput(input);
  if (validation) throw new Error(validation);

  const requestedHours =
    input.employmentType === "full_time"
      ? FULL_TIME_WEEKLY_HOURS
      : input.requestedHoursPerWeek;

  const employee: RotaEmployee = {
    id: randomUUID(),
    name: input.name.trim(),
    employmentType: input.employmentType,
    requestedHoursPerWeek: requestedHours,
    downloadToken: randomUUID().replace(/-/g, ""),
    active: true,
    createdAt: new Date().toISOString(),
  };

  const data = await getData();
  data.employees.push(employee);
  await persist(data);
  return employee;
}

export async function updateRotaEmployee(
  id: string,
  updates: {
    name?: string;
    employmentType?: EmploymentType;
    requestedHoursPerWeek?: number;
    active?: boolean;
  },
): Promise<RotaEmployee | null> {
  const data = await getData();
  const employee = data.employees.find((e) => e.id === id);
  if (!employee) return null;

  if (updates.name !== undefined) employee.name = updates.name.trim();
  if (updates.employmentType !== undefined) {
    employee.employmentType = updates.employmentType;
  }
  if (updates.requestedHoursPerWeek !== undefined) {
    employee.requestedHoursPerWeek = updates.requestedHoursPerWeek;
  }
  if (updates.active !== undefined) employee.active = updates.active;

  if (employee.employmentType === "full_time") {
    employee.requestedHoursPerWeek = FULL_TIME_WEEKLY_HOURS;
  } else {
    const validation = validateEmployeeInput({
      name: employee.name,
      employmentType: employee.employmentType,
      requestedHoursPerWeek: employee.requestedHoursPerWeek,
    });
    if (validation) throw new Error(validation);
  }

  await persist(data);
  return employee;
}

export async function deleteRotaEmployee(id: string): Promise<boolean> {
  const data = await getData();
  const index = data.employees.findIndex((e) => e.id === id);
  if (index === -1) return false;

  data.employees.splice(index, 1);
  for (const monthKey of Object.keys(data.monthlySchedules)) {
    data.monthlySchedules[monthKey] = data.monthlySchedules[monthKey].filter(
      (s) => s.employeeId !== id,
    );
  }

  await persist(data);
  return true;
}

export async function regenerateEmployeeDownloadToken(
  id: string,
): Promise<RotaEmployee | null> {
  const data = await getData();
  const employee = data.employees.find((e) => e.id === id);
  if (!employee) return null;
  employee.downloadToken = randomUUID().replace(/-/g, "");
  await persist(data);
  return employee;
}

export async function generateRotaForMonth(monthKey: string): Promise<RotaShift[]> {
  const data = await getData();
  const monthStart = startOfMonth(parseISO(`${monthKey}-01`));
  const monthEnd = endOfMonth(monthStart);
  const blackouts = await listBlackoutDates({
    from: format(monthStart, "yyyy-MM-dd"),
    to: format(monthEnd, "yyyy-MM-dd"),
  });

  const generated = generateMonthlyRota({
    monthKey,
    employees: data.employees.filter((e) => e.active),
    blackouts,
  });

  data.monthlySchedules[monthKey] = generated;
  await persist(data);
  return generated;
}

export async function findEmployeeByDownloadToken(
  token: string,
): Promise<RotaEmployee | null> {
  const data = await getData();
  return data.employees.find((e) => e.downloadToken === token && e.active) ?? null;
}
