import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth/admin";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#e8e0d4] bg-white p-8 shadow-sm">
        <h1 className="text-center font-serif text-2xl text-[#1a3c34]">
          Pho Ta Admin
        </h1>
        <p className="mt-2 text-center text-sm text-[#5c534a]">
          Sign in to manage bookings
        </p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
