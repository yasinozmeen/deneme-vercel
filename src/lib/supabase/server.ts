import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseKey } = getConfig();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // Server Components'ta cookies() immutable olduğundan burada yazma işlemi yapamayız.
      },
      remove() {
        // Aynı şekilde silme işlemi de desteklenmiyor; Supabase client tarafında oturum kapanınca çerez süresi dolar.
      },
    },
  });
}
