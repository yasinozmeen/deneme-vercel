"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined,
);

type SupabaseProviderProps = {
  children: React.ReactNode;
  initialSession: Session | null;
};

export function SupabaseProvider({
  children,
  initialSession,
}: SupabaseProviderProps) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const value = useMemo(
    () => ({
      supabase,
      session: initialSession,
    }),
    [supabase, initialSession],
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
}
