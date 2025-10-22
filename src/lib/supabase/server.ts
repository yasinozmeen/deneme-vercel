import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

function getConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase ortam değişkenleri tanımlı değil. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini kontrol edin.",
    );
  }

  return { supabaseUrl, supabaseKey };
}

export function createSupabaseServerClient() {
  const { supabaseUrl, supabaseKey } = getConfig();
  return createServerComponentClient(
    { cookies },
    {
      supabaseUrl,
      supabaseKey,
    },
  );
}
