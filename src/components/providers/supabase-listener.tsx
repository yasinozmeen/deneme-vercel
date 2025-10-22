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
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.access_token !== serverAccessToken) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, serverAccessToken]);

  return null;
}
