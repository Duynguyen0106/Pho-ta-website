import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  readRightToWorkDocument,
  readRightToWorkDocumentWithMeta,
  saveRightToWorkDocument,
} from "@/lib/db/rota-documents";
import {
  clearEmployeeRightToWorkDocument,
  listRotaEmployees,
  setEmployeeRightToWorkDocument,
} from "@/lib/db/rota-store";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employeeId = request.nextUrl.searchParams.get("employeeId");
    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const employees = await listRotaEmployees();
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee?.rightToWorkDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const stored = employee.rightToWorkDocument
      ? await readRightToWorkDocumentWithMeta(
          employeeId,
          employee.rightToWorkDocument,
        )
      : await readRightToWorkDocument(employeeId);

    if (!stored) {
      return NextResponse.json({ error: "Document file missing" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(stored.buffer), {
      headers: {
        "Content-Type": stored.meta.mimeType,
        "Content-Disposition": `attachment; filename="${stored.meta.fileName}"`,
      },
    });
  } catch (error) {
    console.error("[admin/rota/documents:GET]", error);
    return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const employeeId = String(form.get("employeeId") ?? "");
    const file = form.get("file");

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const employees = await listRotaEmployees();
    if (!employees.some((e) => e.id === employeeId)) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const meta = await saveRightToWorkDocument(employeeId, file);
    const employee = await setEmployeeRightToWorkDocument(employeeId, meta);
    return NextResponse.json({ employee, document: meta });
  } catch (error) {
    console.error("[admin/rota/documents:POST]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employeeId = request.nextUrl.searchParams.get("employeeId");
    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const employee = await clearEmployeeRightToWorkDocument(employeeId);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error("[admin/rota/documents:DELETE]", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
