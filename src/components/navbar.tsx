"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useEffect, useState } from "react";
import { isAdminUser } from "@/lib/auth";
import clsx from "clsx";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setIsMenuOpen(false);
      router.replace("/");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = session ? isAdminUser(session.user) : false;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-neutral-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-neutral-900">
          Randevu Platformu
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className={clsx(
                "hidden items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:inline-flex",
                pathname === "/dashboard"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100",
              )}
            >
              Randevu Paneli
            </Link>
          ) : null}
          {session && isAdmin ? (
            <Link
              href="/admin"
              className={clsx(
                "hidden items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:inline-flex",
                pathname === "/admin"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100",
              )}
            >
              Admin Paneli
            </Link>
          ) : null}
          {session ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoading}
              className="hidden items-center rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
            >
              {isLoading ? "Çıkış yapılıyor…" : "Çıkış Yap"}
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden items-center rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-800 sm:inline-flex"
            >
              Giriş Yap
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 p-2 text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100 sm:hidden"
            aria-label="Menüyü aç/kapat"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Menüyü aç/kapat</span>
            <span aria-hidden className="text-xl">☰</span>
          </button>
        </div>
      </nav>
      <div
        className={clsx(
          "border-t border-neutral-200 bg-white sm:hidden",
          isMenuOpen ? "block" : "hidden",
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100"
              >
                Randevu Paneli
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100"
                >
                  Admin Paneli
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Çıkış yapılıyor…" : "Çıkış Yap"}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100"
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
