# Portofolio Raden Issa

Live: **https://radenissa.pages.dev**

- Frontend: Vite + React 19 + TypeScript + Tailwind CSS v4. Design token dari `DESIGN.md` ada di `src/index.css`.
- Hosting: Cloudflare Pages (project `radenissa`) + Pages Functions (`functions/`).
- Database: D1 `porto` menyimpan semua konten dan pesan dari form kontak.
- Gambar: R2 `porto`, disajikan lewat `/media/<key>` di domain yang sama. URL `r2.dev` diblokir beberapa ISP Indonesia (Internet Positif), jadi gambar tidak dimuat dari sana.

## Struktur

| Path | Isi |
|------|-----|
| `content/portfolio.json` | Sumber konten, dipakai untuk seed D1 |
| `migrations/` | Skema D1 |
| `functions/` | `/api/portfolio`, `/api/contact`, `/media/*`, `/work/:slug` (meta SEO per proyek), `/sitemap.xml` |
| `server/` | Query D1 dan penyisipan data/meta ke HTML |
| `src/` | Frontend |
| `media-src/` → `media/` | Gambar asli → hasil optimasi (struktur sama dengan bucket R2) |
| `scripts/` | Ekstraksi gambar dari PDF, cutout foto, build media, upload R2, generator seed |

`.env` berisi `CLOUDFLARE_ACCOUNT_ID`, karena login Wrangler punya akses ke 3 akun.

## Perintah

| Tugas | Perintah |
|-------|----------|
| Dev frontend (konten dari JSON) | `npm run dev` |
| Dev lengkap dengan D1/R2 lokal | `npm run db:migrate:local && npm run db:seed:local && npm run media:upload:local && npm run preview` |
| Ubah konten | edit `content/portfolio.json`, lalu `npm run db:seed` |
| Baca pesan dari form kontak | `npm run db:messages` |
| Tambah/ganti gambar | taruh di `media-src/`, daftarkan di `scripts/build-media.mjs`, lalu `npm run media:build && npm run media:upload` |
| Deploy frontend/functions | `npm run deploy` |

Perubahan konten langsung tampil tanpa deploy ulang, karena halaman membaca D1 di setiap request. `npm run db:seed` mengganti semua tabel konten; tabel `messages` tidak disentuh.

### Tombol "Download CV"

Tombol ini tersembunyi selama `profile.resume` bernilai `null`. Untuk mengaktifkannya:

```sh
npx wrangler r2 object put porto/cv/raden-issa-cv.pdf --file "Raden Mochamad Issa Wirakusumah-resume.pdf" --content-type application/pdf --remote
```

Lalu isi `"resume": "cv/raden-issa-cv.pdf"` di `content/portfolio.json` dan jalankan `npm run db:seed`.

### Custom domain

Tambahkan domain di Cloudflare dashboard → Workers & Pages → `radenissa` → Custom domains. Setelah itu ganti `https://radenissa.pages.dev` di `wrangler.jsonc` (`SITE_URL`), `index.html`, dan `public/robots.txt`, lalu jalankan `npm run deploy`.

## Kredit

Font Helvetica Neue ME dari [OnlineWebFonts](http://www.onlinewebfonts.com) (CC BY 4.0). Kreditnya dicantumkan di footer situs sesuai syarat lisensi.
