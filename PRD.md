🧾 PRD — Randevu Sitesi (Vercel + Supabase Auth + Calendly)

🎯 1. Amaç

Kullanıcıların:
	•	Siteye giriş yaparak (e-posta veya Google ile) kimlik doğrulaması yapabilmesi,
	•	Calendly entegrasyonu üzerinden randevu alabilmesi,
	•	Zaman zaman gösterilecek bir popup / duyuru / haber bileşenini görmesi,
	•	Tüm sistemin ucuz, hızlı, serverless (Vercel Edge + Supabase) çalışması hedeflenmektedir.

⸻

🧱 2. Sistem Mimarisi

Katman	Teknoloji	Açıklama
Frontend	Next.js 15 (App Router) + TailwindCSS	Vercel üzerinde deploy edilecek, SSR veya statik sayfa
Auth Backend	Supabase Auth	E-posta ve Google OAuth ile giriş
Database (opsiyonel)	Supabase Postgres	Popup mesajlarını veya admin ayarlarını tutmak için
Randevu Servisi	Calendly Embed	Kullanıcının randevu alacağı iframe / modal
Hosting / Deployment	Vercel	Tamamen ücretsiz (free tier)
Domain	Cloudflare veya Namecheap	randevu.senin-domainin.com alt alan adı önerilir


⸻

🔐 3. Özellikler (User Stories)

3.1. Kimlik Doğrulama
	•	Kullanıcı Supabase Auth üzerinden oturum açabilir.
	•	Login sayfasında e-posta + şifre veya “Google ile giriş yap” seçeneği olur.
	•	Oturum bilgisi Supabase client SDK’sı ile useSession() hook’u üzerinden alınır.
	•	Giriş yapmamış kullanıcılar Calendly bileşenini göremez (redirect → /login).

3.2. Randevu Sayfası
	•	Giriş yaptıktan sonra kullanıcı randevu oluşturma sayfasına yönlendirilir (/dashboard veya /book).
	•	Bu sayfa içinde Calendly inline widget embed edilir:

<InlineWidget url="https://calendly.com/yourname/30min" styles={{height: '700px'}} />


	•	Kullanıcı burada doğrudan randevu slotu seçebilir; kayıt Calendly tarafında tutulur.

3.3. Popup / Duyuru Bileşeni
	•	Siteye giren kullanıcıya “aktif” bir duyuru varsa popup gösterilir.
	•	Duyuru metni Supabase announcements tablosundan çekilir.
	•	Her duyurunun version ve enabled alanı vardır.
	•	Kullanıcı popup’ı kapattığında localStorage’a alert-dismissed-{version} kaydı düşülür.

Tablo yapısı (announcements):

id	message	version	enabled	created_at


3.4. Admin Panel (Opsiyonel)
	•	Admin kullanıcıları (örneğin Supabase “admin” rolü) basit bir form üzerinden yeni popup mesajı ekleyebilir.
	•	Bu özellik 2. fazda yapılabilir.

⸻

🧩 4. Sayfa Akışı

Route	Açıklama
/	Landing page: kısa açıklama, “Giriş Yap / Randevu Al” butonu
/login	Supabase Auth giriş formu (Google + e-posta)
/dashboard	Giriş sonrası Calendly embed + popup bileşeni
/api/health	Basit sağlık kontrol endpoint’i (Vercel edge function)


⸻

⚙️ 5. Teknik Detaylar

5.1. Supabase Kurulumu
	•	Supabase projesi oluşturulur → Anon + Service Key alınır.
	•	Vercel Environment Variables kısmına eklenir:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=


	•	Supabase SDK:

npm install @supabase/supabase-js



5.2. Auth Hook

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient();

const { data: { session } } = await supabase.auth.getSession();
if (!session) redirect('/login');

5.3. Popup Fetch

const { data } = await supabase.from('announcements')
  .select('*')
  .eq('enabled', true)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

5.4. Deployment
	•	GitHub’a push → Vercel repo bağlanır → otomatik deploy.
	•	Domain Cloudflare üzerinden yönlendirilir (CNAME → Vercel).

⸻

🧪 6. Test Senaryoları

Durum	Beklenen Sonuç
Giriş yapılmadan /dashboard açmak	/login’a yönlenir
Giriş yaptıktan sonra /dashboard	Calendly iframe + aktif popup görünür
Popup kapatılır	Sayfa yenilendiğinde tekrar görünmez
Supabase’de enabled=false	Popup görünmez
Mobil tarayıcıda iframe	Responsive şekilde küçülür


⸻

🚀 7. Genişleme Planı (Future Scope)
	•	E-posta doğrulama ve reset password akışı
	•	Admin panel (React form ile)
	•	Randevu sonrası webhook → e-posta veya Slack bildirimi
	•	Dark mode / çoklu dil desteği (EN/TR)

⸻

💰 8. Tahmini Maliyet

Servis	Plan	Maliyet
Vercel	Free tier	0 $
Supabase	Free tier	0 $ (10K row limit)
Domain	Cloudflare	1–2 $/ay
Calendly	Free plan	0 $
Toplam		≈ 1–2 $/ay


⸻

📁 9. Klasör Yapısı (Next.js App Router)

src/
 ├─ app/
 │   ├─ page.tsx              # Landing
 │   ├─ login/page.tsx        # Auth
 │   ├─ dashboard/page.tsx    # Calendly + popup
 │   ├─ layout.tsx
 │   └─ api/health/route.ts   # Edge API
 ├─ components/
 │   ├─ Popup.tsx
 │   └─ Navbar.tsx
 └─ lib/
     └─ supabaseClient.ts
