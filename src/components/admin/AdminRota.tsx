"use client";

import { format, parseISO } from "date-fns";
import { CalendarDays, Copy, Download, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { restaurantHoursLabel } from "@/lib/rota/generate-schedule";
import {
  FULL_TIME_WEEKLY_HOURS,
  PART_TIME_MAX_WEEKLY_HOURS,
  type EmploymentType,
  type RotaEmployee,
  type RotaShift,
} from "@/lib/rota/types";
import { cn } from "@/lib/utils";

interface MonthSummary {
  employeeId: string;
  employeeName: string;
  monthKey: string;
  scheduledHours: number;
  targetHours: number;
  shiftCount: number;
}

export function AdminRota() {
  const [monthKey, setMonthKey] = useState(format(new Date(), "yyyy-MM"));
  const [employees, setEmployees] = useState<RotaEmployee[]>([]);
  const [shifts, setShifts] = useState<RotaShift[]>([]);
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("part_time");
  const [requestedHours, setRequestedHours] = useState(16);

  const fetchRota = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/rota?month=${monthKey}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load rota");
      setEmployees(data.employees ?? []);
      setShifts(data.shifts ?? []);
      setSummaries(data.summaries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rota");
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    fetchRota();
  }, [fetchRota]);

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, (RotaShift & { employeeName: string })[]>();
    for (const shift of shifts) {
      const employee = employees.find((e) => e.id === shift.employeeId);
      const list = map.get(shift.shiftDate) ?? [];
      list.push({ ...shift, employeeName: employee?.name ?? "Staff" });
      map.set(shift.shiftDate, list);
    }
    return map;
  }, [shifts, employees]);

  const calendarDays = useMemo(() => {
    const start = parseISO(`${monthKey}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const days: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(format(d, "yyyy-MM-dd"));
    }
    return days;
  }, [monthKey]);

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/rota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createEmployee",
          name,
          employmentType,
          requestedHoursPerWeek:
            employmentType === "full_time"
              ? FULL_TIME_WEEKLY_HOURS
              : requestedHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add employee");
      setName("");
      setRequestedHours(16);
      await fetchRota();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    if (employees.filter((e) => e.active).length === 0) {
      setError("Add at least one employee before generating the rota.");
      return;
    }
    if (
      shifts.length > 0 &&
      !confirm(
        `Replace the existing schedule for ${format(parseISO(`${monthKey}-01`), "MMMM yyyy")}?`,
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/rota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateMonth", monthKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate rota");
      setShifts(data.shifts ?? []);
      setSummaries(data.summaries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate rota");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEmployee(id: string) {
    if (!confirm("Remove this employee and their shifts?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteEmployee", id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchRota();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  function downloadUrl(employee: RotaEmployee, staff = false) {
    if (staff) {
      return `/api/rota/download?token=${employee.downloadToken}&month=${monthKey}`;
    }
    return `/api/admin/rota/export?employeeId=${employee.id}&month=${monthKey}`;
  }

  async function copyStaffLink(employee: RotaEmployee) {
    const url = `${window.location.origin}/staff/schedule?token=${employee.downloadToken}&month=${monthKey}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(employee.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl font-normal text-foreground">
            Staff rota
          </h2>
          <p className="mt-2 text-xl text-muted">
            Add employees, auto-generate monthly shifts, and share downloadable
            schedules. Restaurant hours {restaurantHoursLabel()}.
          </p>
        </div>
        <label className="block">
          <span className="label-caps">Month</span>
          <input
            type="month"
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className="luxury-input mt-2"
          />
        </label>
      </div>

      {error && (
        <p className="border border-red-800/40 bg-red-950/25 px-5 py-3 text-lg text-red-200">
          {error}
        </p>
      )}

      <form onSubmit={handleAddEmployee} className="luxury-card p-6 sm:p-8">
        <p className="label-caps">Add employee</p>
        <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
          <label className="block min-w-0">
            <span className="label-caps">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="luxury-input mt-3"
              placeholder="e.g. Linh Nguyen"
              required
            />
          </label>
          <label className="block min-w-0">
            <span className="label-caps">Contract</span>
            <select
              value={employmentType}
              onChange={(e) =>
                setEmploymentType(e.target.value as EmploymentType)
              }
              className="luxury-input mt-3"
            >
              <option value="part_time">
                Part-time (under {PART_TIME_MAX_WEEKLY_HOURS}h/week)
              </option>
              <option value="full_time">
                Full-time ({FULL_TIME_WEEKLY_HOURS}h/week)
              </option>
            </select>
          </label>
          {employmentType === "part_time" && (
            <label className="block min-w-0">
              <span className="label-caps">Requested hours per week</span>
              <input
                type="number"
                min={1}
                max={PART_TIME_MAX_WEEKLY_HOURS}
                step={0.5}
                value={requestedHours}
                onChange={(e) => setRequestedHours(Number(e.target.value))}
                className="luxury-input mt-3"
                required
              />
              <span className="mt-2 block text-sm text-muted">
                Must be less than 20 hours for part-time
              </span>
            </label>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            Add employee
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving || employees.length === 0}
            onClick={handleGenerate}
          >
            <RefreshCw size={16} className="mr-2 inline" />
            Generate month schedule
          </Button>
        </div>
      </form>

      <section className="luxury-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <CalendarDays size={20} className="text-gold" />
          <h3 className="font-display text-2xl text-foreground">Team roster</h3>
        </div>
        {loading ? (
          <p className="mt-6 text-muted">Loading…</p>
        ) : employees.length === 0 ? (
          <p className="mt-6 text-muted">
            No employees yet. Add staff above, then generate the monthly rota.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {employees.map((employee) => {
              const summary = summaries.find((s) => s.employeeId === employee.id);
              return (
                <li
                  key={employee.id}
                  className="flex flex-col gap-4 border border-gold/15 bg-surface-alt/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{employee.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {employee.employmentType === "full_time"
                        ? `Full-time · ${FULL_TIME_WEEKLY_HOURS}h/week`
                        : `Part-time · ${employee.requestedHoursPerWeek}h/week`}
                      {summary
                        ? ` · ${summary.scheduledHours}h scheduled (${summary.shiftCount} shifts)`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={downloadUrl(employee)}
                      className="inline-flex min-h-11 items-center gap-2 rounded border border-gold/25 px-4 py-2 text-sm uppercase tracking-[0.08em] text-foreground transition hover:border-gold hover:text-gold"
                    >
                      <Download size={16} />
                      Download CSV
                    </a>
                    <a
                      href={downloadUrl(employee, true)}
                      className="inline-flex min-h-11 items-center gap-2 rounded border border-gold/25 px-4 py-2 text-sm uppercase tracking-[0.08em] text-muted transition hover:border-gold hover:text-gold"
                    >
                      Staff link
                    </a>
                    <button
                      type="button"
                      onClick={() => copyStaffLink(employee)}
                      className="inline-flex min-h-11 items-center gap-2 rounded border border-gold/25 px-4 py-2 text-sm uppercase tracking-[0.08em] text-muted transition hover:border-gold hover:text-gold"
                    >
                      <Copy size={16} />
                      {copiedId === employee.id ? "Copied" : "Copy page link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="inline-flex min-h-11 items-center gap-2 rounded border border-red-900/30 px-4 py-2 text-sm text-red-300 transition hover:border-red-700"
                      aria-label={`Remove ${employee.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="luxury-card p-6 sm:p-8">
        <h3 className="font-display text-2xl text-foreground">
          {format(parseISO(`${monthKey}-01`), "MMMM yyyy")} calendar
        </h3>
        {shifts.length === 0 ? (
          <p className="mt-4 text-muted">
            No shifts generated yet. Add employees and click &quot;Generate month
            schedule&quot;.
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {calendarDays.map((day) => {
              const dayShifts = shiftsByDate.get(day) ?? [];
              return (
                <div
                  key={day}
                  className={cn(
                    "min-w-0 border border-gold/15 p-3",
                    dayShifts.length > 0 ? "bg-surface-alt/50" : "bg-surface/30",
                  )}
                >
                  <p className="text-sm uppercase tracking-[0.12em] text-gold">
                    {format(parseISO(day), "EEE d MMM")}
                  </p>
                  {dayShifts.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">—</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {dayShifts.map((shift) => (
                        <li key={shift.id} className="text-sm text-muted">
                          <span className="text-foreground">
                            {shift.employeeName}
                          </span>
                          <br />
                          {shift.startTime} – {shift.endTime}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
