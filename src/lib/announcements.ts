import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Announcement = {
  id: string;
  title: string | null;
  message: string;
  version: string;
  enabled: boolean;
  created_at: string;
};

export async function getLatestAnnouncement(
  supabase?: SupabaseClient,
): Promise<Announcement | null> {
  const client = supabase ?? (await createSupabaseServerClient());

  const { data, error } = await client
    .from("announcements")
    .select("id, title, message, version, enabled, created_at")
    .eq("enabled", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Duyuru verisi alınırken hata oluştu:", error);
    return null;
  }

  return data;
}
