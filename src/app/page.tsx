import Link from "next/link";

const features = [
  {
    title: "Supabase Auth",
    description:
      "E-posta/şifre veya Google OAuth ile güvenli ve hızlı kimlik doğrulama.",
  },
  {
    title: "Calendly Entegrasyonu",
    description:
      "Kullanıcılar içeride Calendly widget bileşeni üzerinden tek tıkla randevu alır.",
  },
  {
    title: "Akıllı Duyurular",
    description:
      "Supabase Postgres üzerinden yönetilen popup bileşenleri ile kampanya ve haber paylaşın.",
  },
];

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-white to-neutral-100 pb-20">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pt-16 sm:px-6 lg:flex-row lg:items-center lg:gap-20 lg:pt-24">
        <div className="flex-1">
          <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Vercel Edge + Supabase
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
            Randevu süreçlerinizi dakikalar içinde yayına alın
          </h1>
          <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
            Kimlik doğrulama, randevu takvimi ve duyuru sistemini tek bir Next.js
            uygulamasında bir araya getiren hazır altyapı.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-neutral-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Giriş Yap / Başla
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-neutral-300 px-6 py-3 text-center text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100"
            >
              Paneli Gör
            </Link>
          </div>
        </div>
        <div className="flex-1 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
          <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
            <p className="font-semibold text-neutral-900">Livesync Panel Önizlemesi</p>
            <p className="mt-2">
              Giriş yapmış bir kullanıcı, Supabase oturumu sayesinde burada
              Calendly widget bileşenini ve duyuru popup modülünü görür.
            </p>
            <ul className="mt-6 space-y-2 text-neutral-600">
              <li>• Oturum kontrolü → Supabase Auth</li>
              <li>• Randevu oluşturma → Calendly inline widget</li>
              <li>• Popup yönetimi → Supabase Postgres</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Neler Dahil?
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-5xl rounded-3xl bg-neutral-900 px-6 py-12 text-white sm:px-12">
        <div className="flex flex-col items-start gap-6 text-left sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              10 dakikada canlıya çıkmaya hazır olun
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-neutral-300">
              Vercel + Supabase ücretsiz katmanları sayesinde maliyeti minimuma
              indirirken, tek deploy ile güvenle yayın yapın.
            </p>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
          >
            Hemen Başlayın
          </Link>
        </div>
      </section>
    </div>
  );
}
