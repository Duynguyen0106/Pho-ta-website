import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth/admin";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md luxury-card p-10 sm:p-12">
        <div className="flex justify-center">
          <Logo linked={false} />
        </div>
        <p className="mt-6 text-center label-caps">Staff admin</p>
        <p className="mt-4 text-center text-xl text-muted">
          Sign in to manage bookings and menus
        </p>
        <div className="gold-line mx-auto mt-8 w-16" />
        <div className="mt-10">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
