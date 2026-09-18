"use client";

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { unpaidBreakMinutes } from "@/lib/rota/shift-hours";
import type { RotaEmployee, RotaShift } from "@/lib/rota/types";
import { cn } from "@/lib/utils";

interface AdminRotaTeamGridProps {
  monthKey: string;
  employees: RotaEmployee[];
  teamShifts: RotaShift[];
}

export function AdminRotaTeamGrid({
  monthKey,
  employees,
  teamShifts,
}: AdminRotaTeamGridProps) {
  const monthStart = startOfMonth(parseISO(`${monthKey}-01`));
  const monthEnd = endOfMonth(monthStart);
  const activeEmployees = employees.filter((e) => e.active);

  const weeks: Date[][] = [];
  let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  while (weekStart <= monthEnd) {
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 6),
    }).filter((day) => day >= monthStart && day <= monthEnd);
    if (weekDays.length > 0) weeks.push(weekDays);
    weekStart = addDays(weekStart, 7);
  }

  function shiftFor(employeeId: string, dateStr: string): RotaShift | undefined {
    return teamShifts.find(
      (s) => s.employeeId === employeeId && s.shiftDate === dateStr,
    );
  }

  if (teamShifts.length === 0) {
    return (
      <p className="mt-4 text-muted">
        No team schedule for this month yet. Generate the rota to populate the
        calendar.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-8">
      {weeks.map((weekDays) => {
        const weekLabel = `${format(weekDays[0], "d MMM")} – ${format(
          weekDays[weekDays.length - 1],
          "d MMM",
        )}`;
        return (
          <div key={weekLabel} className="overflow-x-auto">
            <p className="mb-3 text-sm uppercase tracking-[0.14em] text-gold">
              Week of {weekLabel}
            </p>
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gold/20 bg-surface-alt/60">
                  <th className="sticky left-0 z-10 min-w-[8rem] border-r border-gold/15 bg-surface-alt/95 px-3 py-3 text-left text-xs uppercase tracking-[0.12em] text-muted">
                    Employee
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.toISOString()}
                      className="min-w-[6.5rem] px-2 py-3 text-center text-xs uppercase tracking-[0.1em] text-muted"
                    >
                      {format(day, "EEE")}
                      <br />
                      <span className="text-foreground">{format(day, "d")}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-gold/10 hover:bg-surface-alt/30"
                  >
                    <td className="sticky left-0 z-10 border-r border-gold/15 bg-background/95 px-3 py-3 font-medium text-foreground">
                      {employee.name}
                    </td>
                    {weekDays.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const shift = shiftFor(employee.id, dateStr);
                      return (
                        <td
                          key={dateStr}
                          className={cn(
                            "px-2 py-3 text-center align-top",
                            shift ? "text-foreground" : "text-muted/40",
                          )}
                        >
                          {shift ? (
                            <span className="inline-block rounded border border-gold/20 bg-gold/10 px-1.5 py-1 text-xs leading-tight">
                              {shift.startTime}
                              <br />
                              {shift.endTime}
                              {unpaidBreakMinutes(shift.startTime, shift.endTime) >
                                0 && (
                                <>
                                  <br />
                                  <span className="text-muted">
                                    {unpaidBreakMinutes(
                                      shift.startTime,
                                      shift.endTime,
                                    )}
                                    m break
                                  </span>
                                </>
                              )}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      <div className="overflow-x-auto">
        <p className="mb-3 text-sm uppercase tracking-[0.14em] text-gold">
          Daily team coverage
        </p>
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gold/20 bg-surface-alt/60">
              <th className="px-3 py-3 text-left text-xs uppercase tracking-[0.12em] text-muted">
                Date
              </th>
              <th className="px-3 py-3 text-left text-xs uppercase tracking-[0.12em] text-muted">
                Staff on shift
              </th>
            </tr>
          </thead>
          <tbody>
            {eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayShifts = teamShifts.filter((s) => s.shiftDate === dateStr);
              return (
                <tr key={dateStr} className="border-b border-gold/10">
                  <td className="whitespace-nowrap px-3 py-3 text-gold">
                    {format(day, "EEE d MMM")}
                  </td>
                  <td className="px-3 py-3 text-muted">
                    {dayShifts.length === 0 ? (
                      "—"
                    ) : (
                      <ul className="space-y-1">
                        {dayShifts.map((shift) => {
                          const employee = employees.find(
                            (e) => e.id === shift.employeeId,
                          );
                          return (
                            <li key={shift.id}>
                              <span className="text-foreground">
                                {employee?.name ?? "Staff"}
                              </span>
                              {" · "}
                              {shift.startTime} – {shift.endTime}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
