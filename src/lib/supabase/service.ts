import { createClient } from "@supabase/supabase-js";

export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Supabase servis anahtarı bulunamadı. SUPABASE_SERVICE_ROLE_KEY env değişkenini tanımlayın.",
    );
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}
