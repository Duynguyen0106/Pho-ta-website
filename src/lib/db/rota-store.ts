import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { listBlackoutDates } from "@/lib/db/blackout-store";
import { getDataDir } from "@/lib/db/data-dir";
import {
  generateMonthlyRota,
  validateEmployeeInput,
} from "@/lib/rota/generate-schedule";
import {
  FULL_TIME_WEEKLY_HOURS,
  type EmploymentType,
  type RotaEmployee,
  type RotaShift,
} from "@/lib/rota/types";
import {
  createServerClient,
  isSupabaseConfigured,
} from "../supabase/client";

interface RotaData {
  employees: RotaEmployee[];
  shifts: RotaShift[];
}

function rotaFile(): string {
  return path.join(getDataDir(), "rota.json");
}

let cache: RotaData | null = null;

function useSupabase(): boolean {
  return isSupabaseConfigured();
}

function getSupabase() {
  return createServerClient();
}

function emptyData(): RotaData {
  return { employees: [], shifts: [] };
}

async function readLocal(): Promise<RotaData> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(rotaFile(), "utf-8");
    cache = JSON.parse(raw) as RotaData;
  } catch {
    cache = emptyData();
  }
  return cache;
}

async function writeLocal(data: RotaData): Promise<void> {
  cache = data;
  const dataDir = getDataDir();
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(rotaFile(), JSON.stringify(data, null, 2));
}

function mapEmployeeRow(row: Record<string, unknown>): RotaEmployee {
  return {
    id: row.id as string,
    name: row.name as string,
    employmentType: row.employment_type as EmploymentType,
    requestedHoursPerWeek: Number(row.requested_hours_per_week),
    downloadToken: row.download_token as string,
    active: row.active !== false,
    createdAt: row.created_at as string,
  };
}

function mapShiftRow(row: Record<string, unknown>): RotaShift {
  return {
    id: row.id as string,
    employeeId: row.employee_id as string,
    shiftDate: row.shift_date as string,
    startTime: (row.start_time as string).slice(0, 5),
    endTime: (row.end_time as string).slice(0, 5),
    monthKey: row.month_key as string,
  };
}

async function readSupabase(): Promise<RotaData> {
  const supabase = getSupabase();
  const [employeesRes, shiftsRes] = await Promise.all([
    supabase.from("rota_employees").select("*").order("name"),
    supabase.from("rota_shifts").select("*").order("shift_date"),
  ]);

  if (employeesRes.error?.message.includes("rota_employees")) {
    return readLocal();
  }
  if (employeesRes.error) throw new Error(employeesRes.error.message);
  if (shiftsRes.error) throw new Error(shiftsRes.error.message);

  return {
    employees: (employeesRes.data ?? []).map(mapEmployeeRow),
    shifts: (shiftsRes.data ?? []).map(mapShiftRow),
  };
}

async function writeSupabaseEmployee(employee: RotaEmployee): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("rota_employees").upsert({
    id: employee.id,
    name: employee.name,
    employment_type: employee.employmentType,
    requested_hours_per_week: employee.requestedHoursPerWeek,
    download_token: employee.downloadToken,
    active: employee.active,
    created_at: employee.createdAt,
  });
  if (error) {
    if (error.message.includes("rota_employees")) return;
    throw new Error(error.message);
  }
}

async function deleteSupabaseEmployee(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("rota_employees").delete().eq("id", id);
  if (error && !error.message.includes("rota_employees")) {
    throw new Error(error.message);
  }
}

async function replaceSupabaseMonthShifts(
  monthKey: string,
  shifts: RotaShift[],
): Promise<void> {
  const supabase = getSupabase();
  const { error: deleteError } = await supabase
    .from("rota_shifts")
    .delete()
    .eq("month_key", monthKey);
  if (deleteError && !deleteError.message.includes("rota_shifts")) {
    throw new Error(deleteError.message);
  }
  if (shifts.length === 0) return;

  const { error } = await supabase.from("rota_shifts").insert(
    shifts.map((shift) => ({
      id: shift.id,
      employee_id: shift.employeeId,
      shift_date: shift.shiftDate,
      start_time: shift.startTime,
      end_time: shift.endTime,
      month_key: shift.monthKey,
    })),
  );
  if (error && !error.message.includes("rota_shifts")) {
    throw new Error(error.message);
  }
}

async function getData(): Promise<RotaData> {
  if (useSupabase()) {
    try {
      return await readSupabase();
    } catch {
      return readLocal();
    }
  }
  return readLocal();
}

async function persist(data: RotaData): Promise<void> {
  cache = data;
  if (useSupabase()) {
    await writeLocal(data);
    return;
  }
  await writeLocal(data);
}

export async function listRotaEmployees(): Promise<RotaEmployee[]> {
  const data = await getData();
  return data.employees.filter((e) => e.active).concat(
    data.employees.filter((e) => !e.active),
  );
}

export async function listRotaShifts(monthKey: string): Promise<RotaShift[]> {
  const data = await getData();
  return data.shifts
    .filter((s) => s.monthKey === monthKey)
    .sort((a, b) =>
      a.shiftDate === b.shiftDate
        ? a.startTime.localeCompare(b.startTime)
        : a.shiftDate.localeCompare(b.shiftDate),
    );
}

export async function getRotaForMonth(monthKey: string): Promise<{
  employees: RotaEmployee[];
  shifts: RotaShift[];
}> {
  const data = await getData();
  return {
    employees: data.employees,
    shifts: data.shifts.filter((s) => s.monthKey === monthKey),
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

  if (useSupabase()) {
    try {
      await writeSupabaseEmployee(employee);
    } catch {
      /* local copy already saved */
    }
  }

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
  if (useSupabase()) {
    try {
      await writeSupabaseEmployee(employee);
    } catch {
      /* ignore */
    }
  }
  return employee;
}

export async function deleteRotaEmployee(id: string): Promise<boolean> {
  const data = await getData();
  const index = data.employees.findIndex((e) => e.id === id);
  if (index === -1) return false;
  data.employees.splice(index, 1);
  data.shifts = data.shifts.filter((s) => s.employeeId !== id);
  await persist(data);
  if (useSupabase()) {
    try {
      await deleteSupabaseEmployee(id);
    } catch {
      /* ignore */
    }
  }
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
  if (useSupabase()) {
    try {
      await writeSupabaseEmployee(employee);
    } catch {
      /* ignore */
    }
  }
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
    employees: data.employees,
    blackouts,
  });

  data.shifts = data.shifts.filter((s) => s.monthKey !== monthKey);
  data.shifts.push(...generated);
  await persist(data);

  if (useSupabase()) {
    try {
      await replaceSupabaseMonthShifts(monthKey, generated);
    } catch {
      /* ignore */
    }
  }

  return generated;
}

export async function findEmployeeByDownloadToken(
  token: string,
): Promise<RotaEmployee | null> {
  const data = await getData();
  return data.employees.find((e) => e.downloadToken === token) ?? null;
}
