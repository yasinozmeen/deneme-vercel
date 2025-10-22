import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Announcement = {
  id: string;
  message: string;
  version: string;
  enabled: boolean;
  created_at: string;
};

export async function getLatestAnnouncement(): Promise<Announcement | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("announcements")
    .select("id, message, version, enabled, created_at")
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
