import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnnouncementPopup } from "@/components/popup";
import { getLatestAnnouncement } from "@/lib/announcements";
import { ScheduleSelector } from "@/components/dashboard/schedule-selector";
import { getUserMeetingCredits } from "@/lib/meeting-credits";

export const metadata = {
  title: "Randevu Paneli",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [sessionResponse, announcement] = await Promise.all([
    supabase.auth.getSession(),
    getLatestAnnouncement(supabase),
  ]);

  const {
    data: { session },
  } = sessionResponse;

  if (!session) {
    redirect("/login");
  }

  const remainingCredits = await getUserMeetingCredits(supabase, session.user.id);

  return (
    <div className="relative bg-neutral-100 py-8 sm:py-12">
      {announcement ? (
        <AnnouncementPopup
          key={announcement.version}
          announcement={announcement}
        />
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Hoş geldin {session.user.email ?? session.user.user_metadata.name} 👋
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Buradan Calendly üzerinden hızlıca randevu oluşturabilir, ek
            duyuruları takip edebilirsin.
          </p>
        </header>
        <section>
          <ScheduleSelector remainingCredits={remainingCredits} />
        </section>
      </div>
    </div>
  );
}
