"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useState } from "react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Anasayfa", auth: "any" as const },
  { href: "/dashboard", label: "Randevu", auth: "protected" as const },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setIsLoading(false);
  };

  return (
    <header className="border-b border-neutral-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-neutral-900">
          Randevu Platformu
        </Link>
        <div className="flex items-center gap-4">
          <ul className="hidden items-center gap-4 text-sm font-medium text-neutral-600 sm:flex">
            {links
              .filter((link) => link.auth === "any" || session)
              .map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      "rounded-full px-3 py-1.5 transition-colors",
                      pathname === link.href
                        ? "bg-neutral-900 text-white"
                        : "hover:bg-neutral-100",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
          </ul>
          {session ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoading}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Çıkış yapılıyor…" : "Çıkış Yap"}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
