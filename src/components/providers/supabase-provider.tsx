"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
  setSession: (session: Session | null) => void;
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
  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const value = useMemo(
    () => ({
      supabase,
      session,
      setSession,
    }),
    [supabase, session],
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
