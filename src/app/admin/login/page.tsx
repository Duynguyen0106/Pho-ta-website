import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth/admin";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0908] px-6">
      <div className="w-full max-w-sm luxury-card p-10">
        <p className="text-center text-[10px] uppercase tracking-[0.35em] text-[#c9a962]">
          Staff
        </p>
        <h1 className="mt-3 text-center font-serif text-2xl font-light text-[#f5f0e6]">
          Pho Ta Admin
        </h1>
        <div className="mt-10">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
