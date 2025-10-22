import { createBrowserClient } from "@supabase/ssr";

function getConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase ortam değişkenleri tanımlı değil. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini kontrol edin.",
    );
  }

  return { supabaseUrl, supabaseKey } as const;
}

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseKey } = getConfig();
  return createBrowserClient(supabaseUrl, supabaseKey);
}
