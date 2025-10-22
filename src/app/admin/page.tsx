import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { CreateAnnouncementForm } from "@/components/admin/create-announcement-form";
import { toggleAnnouncementAction } from "@/app/admin/actions";

export const metadata = {
  title: "Admin Paneli",
};

export const dynamic = "force-dynamic";

type AnnouncementRow = {
  id: string;
  title: string | null;
  message: string;
  version: string;
  enabled: boolean;
  created_at: string;
};

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isAdminUser(session.user)) {
    redirect("/dashboard");
  }

  const service = createSupabaseServiceClient();

  const { data: announcementsData, error: announcementsError } = await service
    .from("announcements")
    .select("id, title, message, version, enabled, created_at")
    .order("created_at", { ascending: false });

  if (announcementsError) {
    console.error("ANNOUNCEMENT_LIST_ERROR", announcementsError);
  }

  const announcements: AnnouncementRow[] = announcementsData ?? [];

  const {
    data: usersData,
    error: usersError,
  } = await service.auth.admin.listUsers({ perPage: 200 });

  if (usersError) {
    console.error("USER_LIST_ERROR", usersError);
  }

  const users = usersData?.users ?? [];

  const formatter = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="bg-neutral-100 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-neutral-900">
            Admin Paneli
          </h1>
          <p className="text-sm text-neutral-500">
            Duyuruları yönetin ve kullanıcı listesini görüntüleyin.
          </p>
        </header>

        <CreateAnnouncementForm />

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">
              Mevcut Duyurular
            </h2>
            <span className="text-sm text-neutral-500">
              Toplam {announcements.length}
            </span>
          </div>
          {announcements.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-3 py-2">Başlık</th>
                    <th className="px-3 py-2">UUID</th>
                    <th className="px-3 py-2">Durum</th>
                    <th className="px-3 py-2">Oluşturulma</th>
                    <th className="px-3 py-2">Mesaj</th>
                    <th className="px-3 py-2 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {announcements.map((announcement) => (
                    <tr key={announcement.id} className="align-top">
                      <td className="px-3 py-3 text-neutral-900">
                        {announcement.title ?? "—"}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-neutral-600">
                        {announcement.id}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            announcement.enabled
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-200 text-neutral-600"
                          }`}
                        >
                          {announcement.enabled ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-neutral-500">
                        {formatter.format(new Date(announcement.created_at))}
                      </td>
                      <td className="px-3 py-3 text-neutral-700">
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {announcement.message}
                        </pre>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <form action={toggleAnnouncementAction} className="inline-flex">
                          <input type="hidden" name="id" value={announcement.id} />
                          <input
                            type="hidden"
                            name="enabled"
                            value={(!announcement.enabled).toString()}
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100"
                          >
                            {announcement.enabled ? "Pasif Yap" : "Aktif Et"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
              Henüz duyuru bulunmuyor.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">
              Kullanıcılar
            </h2>
            <span className="text-sm text-neutral-500">
              Toplam {users.length}
            </span>
          </div>
          {usersError ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              Kullanıcı listesi alınırken hata oluştu.
            </p>
          ) : null}
          {users.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-3 py-2">İsim</th>
                    <th className="px-3 py-2">E-posta</th>
                    <th className="px-3 py-2">Oluşturulma</th>
                    <th className="px-3 py-2">Son Giriş</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="align-top">
                      <td className="px-3 py-3 text-neutral-900">
                        {getDisplayName(user)}
                      </td>
                      <td className="px-3 py-3 text-neutral-700">
                        {user.email ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-neutral-500">
                        {user.created_at
                          ? formatter.format(new Date(user.created_at))
                          : "—"}
                      </td>
                      <td className="px-3 py-3 text-neutral-500">
                        {user.last_sign_in_at
                          ? formatter.format(new Date(user.last_sign_in_at))
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
              Henüz kayıtlı kullanıcı bulunmuyor.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function getDisplayName(user: SupabaseAuthUser): string {
  const metadata = (user.user_metadata as Record<string, unknown>) ?? {};
  const possibleNames = [
    metadata.full_name,
    metadata.name,
    metadata.display_name,
  ];

  const name = possibleNames.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  if (name) {
    return name;
  }

  return user.email ?? "—";
}
