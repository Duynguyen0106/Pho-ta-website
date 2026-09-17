import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  listBookingsForCustomer,
  listCustomers,
  updateCustomerNotes,
} from "@/lib/db/store";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get("id");
    const search = searchParams.get("search") ?? undefined;

    if (customerId) {
      const bookings = await listBookingsForCustomer(customerId);
      return NextResponse.json({ bookings });
    }

    const customers = await listCustomers(search);
    return NextResponse.json({ customers });
  } catch (error) {
    console.error("[admin/customers:GET]", error);
    return NextResponse.json(
      { error: "Failed to load customers" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, notes } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const customer = await updateCustomerNotes(id, notes ?? "");
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("[admin/customers:PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}
