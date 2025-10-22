import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CalendlyWidget } from "@/components/dashboard/calendly-widget";
import { AnnouncementPopup } from "@/components/popup";
import { getLatestAnnouncement } from "@/lib/announcements";

export const metadata = {
  title: "Randevu Paneli",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const announcement = await getLatestAnnouncement();

  return (
    <div className="relative bg-neutral-100 py-12">
      {announcement ? (
        <AnnouncementPopup
          key={announcement.version}
          announcement={announcement}
        />
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Hoş geldin {session.user.email ?? session.user.user_metadata.name} 👋
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Buradan Calendly üzerinden hızlıca randevu oluşturabilir, ek
            duyuruları takip edebilirsin.
          </p>
        </header>
        <section>
          <CalendlyWidget />
        </section>
      </div>
    </div>
  );
}
