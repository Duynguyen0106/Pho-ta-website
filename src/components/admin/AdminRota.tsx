"use client";

import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  Copy,
  Download,
  Pencil,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminRotaTeamGrid } from "@/components/admin/AdminRotaTeamGrid";
import {
  complianceValuesFromEmployee,
  EmployeeComplianceFields,
  emptyComplianceValues,
  type ComplianceFormValues,
} from "@/components/admin/EmployeeComplianceFields";
import { Button } from "@/components/ui/Button";
import { visaAlert, visaTypeLabel } from "@/lib/rota/compliance";
import { restaurantHoursLabel } from "@/lib/rota/generate-schedule";
import { MAX_DAILY_SHIFT_HOURS, UNPAID_BREAK_MINUTES } from "@/lib/rota/types";
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
  const [teamShifts, setTeamShifts] = useState<RotaShift[]>([]);
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("part_time");
  const [requestedHours, setRequestedHours] = useState(16);

  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<EmploymentType>("part_time");
  const [editHours, setEditHours] = useState(16);
  const [addCompliance, setAddCompliance] = useState<ComplianceFormValues>(
    emptyComplianceValues(),
  );
  const [editCompliance, setEditCompliance] = useState<ComplianceFormValues>(
    emptyComplianceValues(),
  );
  const addEmployeeRef = useRef<HTMLElement>(null);
  const hasScrolledToAdd = useRef(false);

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch("/api/admin/rota");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load employees");
      setEmployees(data.employees ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  const fetchMonthSchedule = useCallback(async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch(`/api/admin/rota?month=${monthKey}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load schedule");
      setEmployees(data.employees ?? []);
      setTeamShifts(data.shifts ?? []);
      setSummaries(data.summaries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedule");
    } finally {
      setLoadingSchedule(false);
    }
  }, [monthKey]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchMonthSchedule();
  }, [fetchMonthSchedule]);

  useEffect(() => {
    if (loadingEmployees || hasScrolledToAdd.current) return;
    if (employees.length > 0) return;
    hasScrolledToAdd.current = true;
    addEmployeeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loadingEmployees, employees.length]);

  const hasTeamSchedule = teamShifts.length > 0;

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
          dateOfBirth: addCompliance.dateOfBirth || null,
          rightToWorkCategory: addCompliance.rightToWorkCategory,
          visaType:
            addCompliance.rightToWorkCategory === "visa"
              ? addCompliance.visaType
              : null,
          visaExpiryDate:
            addCompliance.rightToWorkCategory === "visa"
              ? addCompliance.visaExpiryDate
              : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add employee");
      setName("");
      setRequestedHours(16);
      setAddCompliance(emptyComplianceValues());
      await fetchEmployees();
      await fetchMonthSchedule();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(employee: RotaEmployee) {
    setEditingId(employee.id);
    setEditName(employee.name);
    setEditType(employee.employmentType);
    setEditHours(employee.requestedHoursPerWeek);
    setEditCompliance(complianceValuesFromEmployee(employee));
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/rota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateEmployee",
          id,
          name: editName,
          employmentType: editType,
          requestedHoursPerWeek:
            editType === "full_time" ? FULL_TIME_WEEKLY_HOURS : editHours,
          dateOfBirth: editCompliance.dateOfBirth || null,
          rightToWorkCategory: editCompliance.rightToWorkCategory,
          visaType:
            editCompliance.rightToWorkCategory === "visa"
              ? editCompliance.visaType
              : null,
          visaExpiryDate:
            editCompliance.rightToWorkCategory === "visa"
              ? editCompliance.visaExpiryDate
              : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update employee");
      setEditingId(null);
      await fetchEmployees();
      await fetchMonthSchedule();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update employee");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    if (employees.filter((e) => e.active).length === 0) {
      setError("Add at least one employee to the saved roster first.");
      return;
    }
    if (
      hasTeamSchedule &&
      !confirm(
        `Replace the team schedule for ${format(parseISO(`${monthKey}-01`), "MMMM yyyy")}?`,
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
      setTeamShifts(data.shifts ?? []);
      setSummaries(data.summaries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate rota");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEmployee(id: string) {
    if (!confirm("Remove this employee from the saved roster?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteEmployee", id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setEditingId(null);
      await fetchEmployees();
      await fetchMonthSchedule();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  function individualExportUrl(employeeId: string) {
    return `/api/admin/rota/export?employeeId=${employeeId}&month=${monthKey}`;
  }

  function teamExportUrl() {
    return `/api/admin/rota/export?month=${monthKey}`;
  }

  function staffDownloadUrl(employee: RotaEmployee) {
    return `/api/rota/download?token=${employee.downloadToken}&month=${monthKey}`;
  }

  async function copyStaffLink(employee: RotaEmployee) {
    const url = `${window.location.origin}/staff/schedule?token=${employee.downloadToken}&month=${monthKey}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(employee.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function scrollToAddEmployee() {
    addEmployeeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-4xl font-normal text-foreground">
          Staff & rota
        </h2>
        <p className="mt-2 text-xl text-muted">
          Add employee records once, then generate a whole-team schedule each
          month. Shifts are capped at {MAX_DAILY_SHIFT_HOURS} hours per day
          (including a {UNPAID_BREAK_MINUTES}-minute unpaid break on longer
          shifts). Restaurant hours {restaurantHoursLabel()}.
        </p>
      </div>

      <div className="luxury-card border-gold/25 bg-gold/5 p-5 sm:p-6">
        <p className="label-caps text-gold">How it works</p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="rounded border border-gold/20 bg-background/60 p-4">
            <p className="text-sm font-medium uppercase tracking-[0.1em] text-gold">
              Step 1
            </p>
            <p className="mt-2 text-foreground">
              Add each employee&apos;s name, contract, date of birth, and right
              to work details in{" "}
              <button
                type="button"
                onClick={scrollToAddEmployee}
                className="text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
              >
                Saved team roster
              </button>{" "}
              below.
            </p>
          </li>
          <li className="rounded border border-gold/20 bg-background/60 p-4">
            <p className="text-sm font-medium uppercase tracking-[0.1em] text-gold">
              Step 2
            </p>
            <p className="mt-2 text-foreground">
              Pick a month and generate the team schedule. Edit shifts in the
              grid if needed.
            </p>
          </li>
          <li className="rounded border border-gold/20 bg-background/60 p-4">
            <p className="text-sm font-medium uppercase tracking-[0.1em] text-gold">
              Step 3
            </p>
            <p className="mt-2 text-foreground">
              Export team or individual CSV files, or share staff download
              links.
            </p>
          </li>
        </ol>
      </div>

      {error && (
        <p className="border border-red-800/40 bg-red-950/25 px-5 py-3 text-lg text-red-200">
          {error}
        </p>
      )}

      <section
        id="add-employee"
        ref={addEmployeeRef}
        className="luxury-card scroll-mt-28 p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gold" />
            <div>
              <h3 className="font-display text-2xl text-foreground">
                Saved team roster
              </h3>
              <p className="mt-1 text-muted">
                Add and edit employee records here — stored permanently for every
                month.
              </p>
            </div>
          </div>
          {employees.length === 0 && !loadingEmployees && (
            <span className="rounded border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-gold">
              Start here
            </span>
          )}
        </div>

        <form
          onSubmit={handleAddEmployee}
          className="mt-6 rounded border border-gold/25 bg-surface-alt/30 p-5 sm:p-6"
        >
          <p className="font-display text-xl text-foreground">Add employee</p>
          <p className="mt-1 text-sm text-muted">
            Name, contract hours, date of birth, visa status, and right to work
            category. Upload documents after saving by clicking Edit on the
            employee.
          </p>
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
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
              </label>
            )}
          </div>
          <div className="mt-6">
            <EmployeeComplianceFields
              values={addCompliance}
              onChange={setAddCompliance}
              disabled={saving}
            />
          </div>
          <div className="mt-6">
            <Button type="submit" disabled={saving}>
              Save to team roster
            </Button>
          </div>
        </form>

        {loadingEmployees ? (
          <p className="mt-6 text-muted">Loading saved employees…</p>
        ) : employees.length === 0 ? (
          <div className="mt-6 rounded border border-dashed border-gold/25 bg-surface-alt/20 p-5 text-center">
            <p className="text-muted">
              No employees saved yet. Use the form above to add your first team
              member.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {employees.map((employee) => (
              <li
                key={employee.id}
                className="border border-gold/15 bg-surface-alt/40 p-4"
              >
                {editingId === employee.id ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block min-w-0">
                      <span className="label-caps">Name</span>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="luxury-input mt-2"
                      />
                    </label>
                    <label className="block min-w-0">
                      <span className="label-caps">Contract</span>
                      <select
                        value={editType}
                        onChange={(e) =>
                          setEditType(e.target.value as EmploymentType)
                        }
                        className="luxury-input mt-2"
                      >
                        <option value="part_time">Part-time</option>
                        <option value="full_time">Full-time</option>
                      </select>
                    </label>
                    {editType === "part_time" && (
                      <label className="block min-w-0">
                        <span className="label-caps">Hours/week</span>
                        <input
                          type="number"
                          min={1}
                          max={PART_TIME_MAX_WEEKLY_HOURS}
                          step={0.5}
                          value={editHours}
                          onChange={(e) => setEditHours(Number(e.target.value))}
                          className="luxury-input mt-2"
                        />
                      </label>
                    )}
                    <div className="md:col-span-2">
                      <EmployeeComplianceFields
                        values={editCompliance}
                        onChange={setEditCompliance}
                        employee={employee}
                        disabled={saving}
                        onDocumentChange={() => {
                          void fetchEmployees();
                          void fetchMonthSchedule();
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 md:col-span-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={saving}
                        onClick={() => handleSaveEdit(employee.id)}
                      >
                        Save changes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{employee.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {employee.employmentType === "full_time"
                          ? `Full-time · ${FULL_TIME_WEEKLY_HOURS}h/week`
                          : `Part-time · ${employee.requestedHoursPerWeek}h/week`}
                        {employee.dateOfBirth
                          ? ` · DOB ${format(parseISO(employee.dateOfBirth), "d MMM yyyy")}`
                          : ""}
                      </p>
                      {employee.rightToWorkCategory === "visa" && (
                        <p className="mt-1 text-sm text-muted">
                          {visaTypeLabel(employee.visaType)}
                          {employee.visaExpiryDate
                            ? ` · expires ${format(parseISO(employee.visaExpiryDate), "d MMM yyyy")}`
                            : ""}
                        </p>
                      )}
                      {visaAlert(employee.visaExpiryDate) === "expired" && (
                        <p className="mt-1 text-sm text-red-300">Visa expired</p>
                      )}
                      {visaAlert(employee.visaExpiryDate) === "expiring_soon" && (
                        <p className="mt-1 text-sm text-amber-300">
                          Visa expiring within 60 days
                        </p>
                      )}
                      {employee.rightToWorkDocument ? (
                        <p className="mt-1 text-sm text-gold/80">
                          Right to work document on file
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-muted">
                          No right to work document uploaded
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(employee)}
                        className="inline-flex min-h-11 items-center gap-2 rounded border border-gold/25 px-4 py-2 text-sm uppercase tracking-[0.08em] text-muted transition hover:border-gold hover:text-gold"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="inline-flex min-h-11 items-center gap-2 rounded border border-red-900/30 px-4 py-2 text-sm text-red-300 transition hover:border-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="luxury-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} className="text-gold" />
            <div>
              <h3 className="font-display text-2xl text-foreground">
                Monthly team schedule
              </h3>
              <p className="mt-1 text-muted">
                Generate one rota for the whole team (max{" "}
                {MAX_DAILY_SHIFT_HOURS}h per employee per day, break included),
                then export individual schedules from it.
              </p>
            </div>
          </div>
          <label className="block min-w-0">
            <span className="label-caps">Month</span>
            <input
              type="month"
              value={monthKey}
              onChange={(e) => setMonthKey(e.target.value)}
              className="luxury-input mt-2"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-gold/15 pt-6">
          <Button
            type="button"
            disabled={saving || employees.length === 0}
            onClick={handleGenerate}
          >
            <RefreshCw size={16} className="mr-2 inline" />
            Generate team schedule
          </Button>
          {hasTeamSchedule && (
            <a
              href={teamExportUrl()}
              className="inline-flex min-h-11 items-center gap-2 rounded border border-gold bg-gold/10 px-5 py-3 text-sm font-medium uppercase tracking-[0.1em] text-foreground transition hover:border-gold-light hover:text-gold"
            >
              <Download size={16} />
              Download team CSV
            </a>
          )}
        </div>

        {loadingSchedule ? (
          <p className="mt-6 text-muted">Loading schedule…</p>
        ) : (
          <>
            <AdminRotaTeamGrid
              monthKey={monthKey}
              employees={employees}
              teamShifts={teamShifts}
            />

            {hasTeamSchedule && (
              <div className="mt-8 border-t border-gold/15 pt-6">
                <p className="label-caps">Individual schedules</p>
                <p className="mt-2 text-sm text-muted">
                  Each export is extracted from the team schedule above.
                </p>
                <ul className="mt-4 space-y-3">
                  {employees
                    .filter((e) => e.active)
                    .map((employee) => {
                      const summary = summaries.find(
                        (s) => s.employeeId === employee.id,
                      );
                      return (
                        <li
                          key={employee.id}
                          className="flex flex-col gap-3 border border-gold/15 bg-surface-alt/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {employee.name}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {summary
                                ? `${summary.scheduledHours}h · ${summary.shiftCount} shifts`
                                : "No shifts this month"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={individualExportUrl(employee.id)}
                              className={cn(
                                "inline-flex min-h-11 items-center gap-2 rounded border border-gold/25 px-4 py-2 text-sm uppercase tracking-[0.08em] transition hover:border-gold hover:text-gold",
                                !summary?.shiftCount &&
                                  "pointer-events-none opacity-40",
                              )}
                            >
                              <Download size={16} />
                              Export CSV
                            </a>
                            <a
                              href={staffDownloadUrl(employee)}
                              className="inline-flex min-h-11 items-center gap-2 rounded border border-gold/25 px-4 py-2 text-sm uppercase tracking-[0.08em] text-muted transition hover:border-gold hover:text-gold"
                            >
                              Staff download
                            </a>
                            <button
                              type="button"
                              onClick={() => copyStaffLink(employee)}
                              className="inline-flex min-h-11 items-center gap-2 rounded border border-gold/25 px-4 py-2 text-sm uppercase tracking-[0.08em] text-muted transition hover:border-gold hover:text-gold"
                            >
                              <Copy size={16} />
                              {copiedId === employee.id ? "Copied" : "Copy link"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
