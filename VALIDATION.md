# Bukti verifikasi

Tanggal: 6 November 2026 (Asia/Jakarta). Hasil di bawah berasal dari eksekusi, bukan sekadar daftar perintah.

## Menu dan alur

- PDF halaman 1 diekstrak dan dirender; seluruh 32 nama, kategori, deskripsi yang tersedia, dan harga dibandingkan secara visual.
- Hot/Ice mengikuti kolom PDF. Corn Ribs Rp25.000, tanpa varian suhu buatan pada harga tunggal.
- Pengguna memilih ringkasan untuk kasir, tanpa WhatsApp. Situs tidak mengirim/menerima pesanan di server.

## Pemeriksaan lokal

Bagian baseline ini mencatat verifikasi awal aplikasi sebelum perluasan pipeline. Hasil tambahan portofolio dicatat di bagian berikutnya; status remote terkini dapat diperiksa melalui workflow yang ditautkan.

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | 4/4 lulus: kelengkapan/harga katalog, data keranjang tidak valid, batas jumlah, perhitungan dan teks bon |
| `npm run typecheck` | Lulus; build juga memeriksa TypeScript |
| `npm run build` | Lulus, static export; tidak ada runtime function |
| `npm run test:e2e` | 12/12 lulus pada production export lokal |
| Audit ulang sesudah koreksi label logo | 5/5 ukuran layar lulus; mencakup WCAG 2.1 A/AA dan 2.2 AA |
| `npm audit --audit-level=low` | 0 kerentanan |
| Pemindaian secret sumber dan export | Tidak ditemukan kredensial pada 53 berkas saat pemeriksaan setelah dokumentasi ditambahkan |
| Git ignore | `.env`, `.vercel/`, `out/`, dan bukti lokal diabaikan |

Alur browser mencakup katalog, Back/filter URL, pencarian kosong/reset, Hot/Ice, tambah/kurang/hapus, total Rp85.000 untuk 2 Matcha Latte Ice + 1 Chicken Katsu, nama wajib, pemulihan setelah reload, pilihan bawa pulang, catatan, dialog, Enter/Escape/pengembalian fokus, clipboard, CSS cetak, dan pesanan baru.

Kasus gangguan storage/clipboard diuji dengan fault injection khusus pengujian. Offline diuji dengan memutus jaringan browser sesudah katalog nyata dimuat. Data gangguan tersebut tidak menjadi data aplikasi atau bukti pesanan diterima kafe.

## Tampilan dan aksesibilitas

- Lebar 320, 375, 768, 1024, 1440px: tanpa overflow horizontal; target interaktif minimal 44px, dengan radio memakai area label.
- Axe: 0 pelanggaran pada halaman menu dan dialog untuk setiap ukuran, termasuk kontras dan nama aksesibel.
- Screenshot desktop, ponsel, dan dialog diperiksa secara visual. Target sentuh tautan dan spasi copy ponsel diperbaiki berdasarkan temuan nyata.
- Lighthouse lokal sesudah koreksi: Performance 98, Accessibility 100, Best Practices 100, SEO 100; LCP 976ms, CLS 0, TBT 177ms. Ini pengukuran lab satu sesi, bukan data p75/INP lapangan.
- `evidence/lighthouse-local.json`, screenshot dalam `evidence/` dan `test-results/` tersedia secara lokal dan diabaikan Git.

## Deployment

- Pembacaan API awal mengonfirmasi paket `hobby` pada akun tujuan.
- Skrip deployment memeriksa kembali paket, Git bersih, commit remote, secret, dan export sebelum publikasi. Hanya hasil statis serta `vercel.json` yang dikirim.
- Repo dibuat dengan `gh`, bersifat privat: [Adrian463588/auu-ahh-cafe-menu](https://github.com/Adrian463588/auu-ahh-cafe-menu).
- Commit aplikasi `f8ebe7121ae9de665c7bc0c0f224c2497969a282` dipush dan dicocokkan dengan remote sebelum deployment; commit berikutnya hanya menyelesaikan dokumentasi verifikasi ini.
- URL produksi: [auu-ahh-cafe-menu.vercel.app](https://auu-ahh-cafe-menu.vercel.app), HTTP 200 dan API menyatakan READY. API akun kembali mengonfirmasi paket `hobby` sesudah deployment.
- Seluruh **12/12 browser test lulus di URL publik**, termasuk alur pesanan nyata dari katalog, penyimpanan perangkat, varian, jumlah, ringkasan, salin, keyboard, CSS cetak, error/offline, responsivitas, serta axe halaman/dialog pada lima ukuran.
- PDF publik HTTP 200 dan SHA-256 cocok dengan sumber. `/.env`, `/.git/config`, `/package.json`, `/scripts/deploy.mjs` semuanya HTTP 404. Header `nosniff` dan Content Security Policy terverifikasi.
- `.vercel/deployment.json` lokal menyimpan ID, source commit, SHA-256 artefak, status, dan URL deployment. `evidence/production-check.json` menyimpan hasil pemeriksaan publik. Keduanya diabaikan Git dan tidak memuat token.
- Sesudah commit dokumentasi terakhir, jalankan deployment dari commit yang telah dipush; skrip mencatat commit tersebut di metadata. Alur utama dan pemeriksaan publik diulang untuk deployment final.

## Batas bukti

Dialog cetak sistem, printer fisik, kunjungan pertama/reload offline, pemrosesan kasir, pembayaran, stok, dan data performa lapangan tidak diuji atau diklaim. Tidak ada integrasi tersebut pada situs ini.

## Perluasan portofolio DevSecOps

Pemeriksaan lokal 6 November 2026:

- `npm ci --ignore-scripts`: berhasil dari lockfile baru, 221 paket diaudit.
- `npm run lint`: ESLint 10 lulus dengan **0 warning**, termasuk aturan Next/TypeScript/React Hooks dan guardrails evaluasi kode.
- `npm run lint:workflows`: actionlint 1.7.12 lulus untuk CI/CD dan health workflow.
- `npm audit --audit-level=low`: **0 kerentanan** setelah override patched minimatch; tidak ada severity yang dikecualikan.
- `npm test`: **5/5 lulus**, termasuk penolakan commit mismatch, artefak diubah/ditambah, dan environment file dalam export.
- TypeScript dan production build lulus. Seluruh **12/12 browser test** lulus; klik brand/reset filter ikut diverifikasi setelah perbaikan lint.
- Gitleaks 8.30.1: **0 temuan** pada 2 commit baseline, 40 file tracked saat itu, serta export publik. Canary yang dihasilkan saat pengujian ditolak oleh rule Vercel dan tidak pernah dicetak.
- Binary Gitleaks/actionlint diverifikasi terhadap SHA-256 penerbit; scanner selalu memakai redaksi penuh.
- `.env` tetap diabaikan Git; ACL Windows dibatasi ke pemilik akun, SYSTEM, dan Administrators. Nilai credential tidak dicetak.
- GitHub repository secret VERCEL_TOKEN dan variables project/team dikonfigurasi; tidak ada nilai secret di source, artefak, atau README.
- API GitHub mengonfirmasi default permission read, larangan bot approval, allowlist Actions GitHub-owned, wajib SHA pinning, serta dependency alerts aktif.
- Branch protection `main`: PR, strict status **Quality and security gates**, enforce admins, force-push/deletion nonaktif. Satu maintainer tidak mensyaratkan approval kedua.

Verifikasi remote dijalankan melalui [DevSecOps CI/CD](https://github.com/Adrian463588/auu-ahh-cafe-menu/actions/workflows/ci.yml) pada PR/push dan [Service health](https://github.com/Adrian463588/auu-ahh-cafe-menu/actions/workflows/health.yml). Log run, artefak build/proof, dan `/build-info.json` adalah lokasi bukti aktual; konfigurasi workflow saja tidak membuktikan kelulusan. SLO 30 hari tetap berupa target sampai data yang cukup tersedia.

### Bukti remote pertama

| Bukti | Hasil aktual |
| --- | --- |
| [PR #1](https://github.com/Adrian463588/auu-ahh-cafe-menu/pull/1) / [run PR](https://github.com/Adrian463588/auu-ahh-cafe-menu/actions/runs/42161470183) | Quality/security lulus; job publikasi dan produksi skipped sesuai kebijakan PR |
| [Run push main](https://github.com/Adrian463588/auu-ahh-cafe-menu/actions/runs/42161809911) | Ketiga job quality/security, deployment Hobby, dan smoke produksi lulus pada commit `f8d2029b76e4f1365e90863003efd13dfeb3b2a0` |
| [Service health manual](https://github.com/Adrian463588/auu-ahh-cafe-menu/actions/runs/42162369564) | Probe lulus pada commit yang sama; ini satu eksekusi nyata, bukan data SLO 30 hari |
| Artefak `static-release-f8d2029b76e4f1365e90863003efd13dfeb3b2a0` diunduh ulang | 27 fingerprint file/config cocok; source SHA cocok; SHA-256 manifest `222e4916f6620b45afe6e77c7c9e1cc8ba9c0ee0388941728322f83cc9245281`; Gitleaks dan pencocokan token aktual: 0 temuan |
| Log PR dan push main | 88.445 dan 217.936 byte log dipindai dengan Gitleaks redacted serta dibandingkan dengan token lokal tanpa mencetaknya; 0 temuan |

API audit tambahan menemukan default output directory proyek lama masih `.` meskipun deployment sudah memakai `out`. Rekonsiliasi `PATCH` setting proyek kini dijalankan setelah verifikasi main, dengan pemeriksaan respons; perubahan itu mengikuti PR/CI yang sama. Bukti run pertama di tabel merupakan catatan historis; run berikutnya dan commit terpasang terkini tersedia pada Actions dan `/build-info.json`.
