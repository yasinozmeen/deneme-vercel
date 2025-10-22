"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";

type FormState = {
  email: string;
  password: string;
  error: string | null;
};

const initialState: FormState = {
  email: "",
  password: "",
  error: null,
};

export function LoginForm() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: "email" | "password") => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        [field]: event.target.value,
        error: null,
      }));
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormState((prev) => ({ ...prev, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email: formState.email,
      password: formState.password,
    });

    if (error) {
      setFormState((prev) => ({
        ...prev,
        error: error.message,
      }));
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: origin ? `${origin}/auth/callback` : undefined,
      },
    });

    if (error) {
      setFormState((prev) => ({
        ...prev,
        error: error.message,
      }));
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg"
    >
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Randevu Platformuna Giriş Yap
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Sisteme erişmek için Supabase hesabınızla oturum açın.
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
        E-posta
        <input
          required
          type="email"
          className="rounded-xl border border-neutral-300 px-4 py-2 text-base text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          placeholder="ornek@domain.com"
          value={formState.email}
          onChange={handleChange("email")}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
        Şifre
        <div className="relative">
          <input
            required
            minLength={6}
            type={showPassword ? "text" : "password"}
            className="w-full rounded-xl border border-neutral-300 px-4 py-2 pr-12 text-base text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            placeholder="Şifrenizi girin"
            value={formState.password}
            onChange={handleChange("password")}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-sm text-neutral-500"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Gizle" : "Göster"}
          </button>
        </div>
      </label>

      {formState.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {formState.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Giriş yapılıyor…" : "E-posta ile Giriş Yap"}
      </button>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs uppercase tracking-wide text-neutral-400">
          veya
        </span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Google ile giriş yap
      </button>
    </form>
  );
}
