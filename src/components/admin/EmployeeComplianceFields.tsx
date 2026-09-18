"use client";

import { format, parseISO } from "date-fns";
import { Download, FileUp, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  RIGHT_TO_WORK_CATEGORIES,
  VISA_TYPES,
  visaTypeLabel,
} from "@/lib/rota/compliance";
import type { RightToWorkCategory, RotaEmployee } from "@/lib/rota/types";

export interface ComplianceFormValues {
  dateOfBirth: string;
  rightToWorkCategory: RightToWorkCategory;
  visaType: string;
  visaExpiryDate: string;
}

interface EmployeeComplianceFieldsProps {
  values: ComplianceFormValues;
  onChange: (values: ComplianceFormValues) => void;
  employee?: RotaEmployee | null;
  disabled?: boolean;
  onDocumentChange?: () => void;
}

export function EmployeeComplianceFields({
  values,
  onChange,
  employee,
  disabled = false,
  onDocumentChange,
}: EmployeeComplianceFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const onVisa = values.rightToWorkCategory === "visa";

  async function handleUpload(file: File) {
    if (!employee) {
      setUploadError("Save the employee first, then upload their document.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("employeeId", employee.id);
      form.append("file", file);
      const res = await fetch("/api/admin/rota/documents", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onDocumentChange?.();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemoveDocument() {
    if (!employee?.rightToWorkDocument) return;
    if (!confirm("Remove the uploaded right to work document?")) return;

    setUploading(true);
    setUploadError("");
    try {
      const res = await fetch(
        `/api/admin/rota/documents?employeeId=${employee.id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      onDocumentChange?.();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 rounded border border-gold/15 bg-surface/40 p-4 sm:p-5">
      <div>
        <p className="label-caps">Right to work & visa</p>
        <p className="mt-1 text-sm text-muted">
          Record date of birth, visa details where applicable, and store a copy
          of the right to work document.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
        <label className="block min-w-0">
          <span className="label-caps">Date of birth</span>
          <input
            type="date"
            value={values.dateOfBirth}
            onChange={(e) =>
              onChange({ ...values, dateOfBirth: e.target.value })
            }
            className="luxury-input luxury-input-date mt-3"
            disabled={disabled}
          />
        </label>
        <label className="block min-w-0">
          <span className="label-caps">Right to work status</span>
          <select
            value={values.rightToWorkCategory}
            onChange={(e) =>
              onChange({
                ...values,
                rightToWorkCategory: e.target.value as RightToWorkCategory,
                visaType: e.target.value === "visa" ? values.visaType : "",
                visaExpiryDate:
                  e.target.value === "visa" ? values.visaExpiryDate : "",
              })
            }
            className="luxury-input mt-3"
            disabled={disabled}
          >
            {RIGHT_TO_WORK_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {onVisa && (
          <>
            <label className="block min-w-0">
              <span className="label-caps">Visa type</span>
              <select
                value={values.visaType}
                onChange={(e) =>
                  onChange({ ...values, visaType: e.target.value })
                }
                className="luxury-input mt-3"
                required
                disabled={disabled}
              >
                <option value="">Select visa type</option>
                {VISA_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className="label-caps">Visa expiry date</span>
              <input
                type="date"
                value={values.visaExpiryDate}
                onChange={(e) =>
                  onChange({ ...values, visaExpiryDate: e.target.value })
                }
                className="luxury-input luxury-input-date mt-3"
                required
                disabled={disabled}
              />
            </label>
          </>
        )}
      </div>

      <div className="border-t border-gold/10 pt-5">
        <span className="label-caps">Right to work document</span>
        <p className="mt-1 text-sm text-muted">
          PDF or image up to 5 MB. {employee ? "" : "Available after saving the employee."}
        </p>

        {employee?.rightToWorkDocument ? (
          <div className="mt-4 flex flex-col gap-3 rounded border border-gold/20 bg-surface-alt/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {employee.rightToWorkDocument.fileName}
              </p>
              <p className="mt-1 text-sm text-muted">
                Uploaded{" "}
                {format(
                  parseISO(employee.rightToWorkDocument.uploadedAt),
                  "d MMM yyyy HH:mm",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/api/admin/rota/documents?employeeId=${employee.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded border border-gold/25 px-4 py-2 text-sm uppercase tracking-[0.08em] text-foreground transition hover:border-gold hover:text-gold"
              >
                <Download size={16} />
                Download
              </a>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || disabled}
                onClick={() => fileInputRef.current?.click()}
              >
                Replace
              </Button>
              <button
                type="button"
                disabled={uploading || disabled}
                onClick={handleRemoveDocument}
                className="inline-flex min-h-11 items-center gap-2 rounded border border-red-900/30 px-4 py-2 text-sm text-red-300 transition hover:border-red-700"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading || disabled || !employee}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp size={16} className="mr-2 inline" />
              {employee ? "Upload document" : "Save employee to upload"}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled || !employee}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />

        {uploadError && (
          <p className="mt-3 text-sm text-red-300">{uploadError}</p>
        )}
      </div>

      {employee && onVisa && employee.visaType && (
        <p className="text-sm text-muted">
          Visa on file: {visaTypeLabel(employee.visaType)}
          {employee.visaExpiryDate
            ? ` · expires ${format(parseISO(employee.visaExpiryDate), "d MMM yyyy")}`
            : ""}
        </p>
      )}
    </div>
  );
}

export function emptyComplianceValues(): ComplianceFormValues {
  return {
    dateOfBirth: "",
    rightToWorkCategory: "uk_irish",
    visaType: "",
    visaExpiryDate: "",
  };
}

export function complianceValuesFromEmployee(
  employee: RotaEmployee,
): ComplianceFormValues {
  return {
    dateOfBirth: employee.dateOfBirth ?? "",
    rightToWorkCategory: employee.rightToWorkCategory,
    visaType: employee.visaType ?? "",
    visaExpiryDate: employee.visaExpiryDate ?? "",
  };
}
