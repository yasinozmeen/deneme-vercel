"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "./supabase-provider";

type SupabaseListenerProps = {
  serverAccessToken?: string;
};

export function SupabaseListener({
  serverAccessToken,
}: SupabaseListenerProps) {
  const { supabase, setSession } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (session?.access_token !== serverAccessToken) {
        router.refresh();
      }

      if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, setSession, supabase, serverAccessToken]);

  return null;
}
