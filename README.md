# Cyllene Sleep Track

**Cyllene Uyku Takipçisi** — gece uykunuzu cihaz içi ses analizi ile izleyen PWA.

## Özellikler

- On-device horlama, öksürük ve gürültü tespiti (YAMNet)
- Uyku modu kayıt ekranı ve wake lock
- Tespit edilen olayları saat ile listeleme ve ses dinleme
- Sabah raporu dashboard'u
- Supabase auth ve oturum senkronizasyonu

## Kurulum

```bash
npm install
cp .env.example .env.local
# Supabase URL ve anon key'i .env.local'e ekleyin
npm run dev
```

## Deploy

Vercel'e bağlayın ve `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ortam değişkenlerini ekleyin.

## Repo

https://github.com/nevzat-cyllene/cyllene-sleep-track
