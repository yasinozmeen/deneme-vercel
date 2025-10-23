# deneme-vercel – Randevu Platformu

Supabase Auth, Calendly entegrasyonu ve yönetilebilir popup sistemi içeren Next.js tabanlı randevu platformu. Proje, serverless mimariyle (Vercel Edge + Supabase) minimum maliyetle çalışacak şekilde tasarlandı.

## Özellikler
- Supabase Auth ile e-posta/şifre tabanlı oturum açma (`/login`)
- Giriş yapan kullanıcılar için Calendly içeren randevu paneli (`/dashboard`)
- Varsayılan 100 toplantı hakkı, Calendly webhook'uyla otomatik düşer
- Supabase Postgres üzerinde yönetilen popup duyuruları
- `GET /api/health` ile edge sağlık kontrolü
- Tailwind CSS (v4) tabanlı arayüz

## Kurulum
1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. `.env.example` dosyasını `.env.local` olarak kopyalayın ve Supabase/Calendly bilgilerinizi girin:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://<proje-id>.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
   NEXT_PUBLIC_CALENDLY_URL="https://calendly.com/yourname/30min"
   SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
   CALENDLY_WEBHOOK_SIGNING_KEY="<calendly-webhook-signing-key>"
   ```
3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
4. Tarayıcıdan [http://localhost:3000](http://localhost:3000) adresine gidin.

## Supabase Yapılandırması
`announcements` tablosunu oluşturmak için aşağıdaki SQL'i çalıştırın:
```sql
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  version text not null,
  enabled boolean default true,
  created_at timestamptz default now()
);
```

> Not: Popup bileşeni, kullanıcı yerelde popup'ı kapattığında `localStorage` üzerine `alert-dismissed-{version}` anahtarı yazar.

## Deploy
1. GitHub reposunu Vercel'e bağlayın.
2. `supabase/migrations/20251023_meeting_credits.sql` dosyasındaki SQL'i Supabase projenizde çalıştırın (Auth → SQL Editor veya CLI).
3. Vercel ortam değişkenlerini (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CALENDLY_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CALENDLY_WEBHOOK_SIGNING_KEY`) tanımlayın.
4. Calendly hesabınızda webhook'u `https://<proje-adı>.vercel.app/api/calendly/webhook` adresine yönlendirin ve aynı signing key'i kullanın.
5. Deploy sonrasında `https://<proje-adı>.vercel.app/api/health` endpoint’i çalışıyor olmalı.

## Kaynaklar
- [PRD.md](PRD.md) – Ürün gereksinim dokümanı
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/server/frameworks/nextjs)
- [Calendly Embed Docs](https://developer.calendly.com/api-docs/embedded-availability)
