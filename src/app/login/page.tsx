import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Giriş Yap | Randevu Platformu",
};

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-neutral-100 px-4 py-16">
      <LoginForm />
    </div>
  );
}
