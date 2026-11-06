# Bukti verifikasi

Tanggal: 6 November 2026 (Asia/Jakarta). Hasil di bawah berasal dari eksekusi, bukan sekadar daftar perintah.

## Menu dan alur

- PDF halaman 1 diekstrak dan dirender; seluruh 32 nama, kategori, deskripsi yang tersedia, dan harga dibandingkan secara visual.
- Hot/Ice mengikuti kolom PDF. Corn Ribs Rp25.000, tanpa varian suhu buatan pada harga tunggal.
- Pengguna memilih ringkasan untuk kasir, tanpa WhatsApp. Situs tidak mengirim/menerima pesanan di server.

## Pemeriksaan lokal

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
