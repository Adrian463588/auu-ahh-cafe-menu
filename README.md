# AUU AHH Cafe

Menu dan penyusun pesanan sederhana untuk proyek kuliah/personal. Dibuat dengan Next.js 16, React 19, dan TypeScript. Situs diekspor menjadi berkas statis; tidak memerlukan database, server function, atau layanan berbayar.

[Buka website](https://auu-ahh-cafe-menu.vercel.app) · [Repo privat](https://github.com/Adrian463588/auu-ahh-cafe-menu)

## Fitur

- 32 menu dalam 7 kategori dari dokumen asli, beserta harga dan varian Hot/Ice yang tercantum.
- Pencarian, filter kategori, jumlah pesanan, hapus, dan total rupiah.
- Keranjang dan detail pemesan disimpan hanya di perangkat pengunjung.
- Ringkasan untuk ditunjukkan ke kasir, dengan pilihan makan di tempat/bawa pulang, salin, dan cetak/simpan PDF melalui browser.
- Dukungan keyboard, layout ponsel/tablet/desktop, pemulihan error penyimpanan, dan penggunaan halaman yang sudah terbuka saat offline.

Ringkasan **belum dikirim atau dikonfirmasi oleh kafe**. Pembayaran, ketersediaan, serta permintaan khusus dikonfirmasi langsung ke kasir. Tidak ada pengumpulan pesanan di server.

## Menjalankan

Gunakan Node.js 24 dan npm.

```sh
npm ci
npm run dev
```

Buka URL lokal yang dicetak Next.js. Untuk build dan preview hasil produksi:

```sh
npm run build
npm run preview
```

Preview statis tersedia di `http://127.0.0.1:4173`.

## Verifikasi

```sh
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --audit-level=low
```

Pengujian browser memakai katalog nyata untuk alur pesanan, ringkasan, pencarian, dan varian. Kasus tambahan menguji storage rusak/diblokir, clipboard gagal, offline, keyboard, cetak, serta axe pada lebar 320/375/768/1024/1440px. Artefak lokal disimpan pada `test-results/` yang diabaikan Git. Hasil eksekusi dicatat di `VALIDATION.md`; jangan menganggap daftar perintah sebagai bukti kelulusan.

## Deployment Vercel gratis

1. Salin `.env.example` menjadi `.env`, lalu isi `VERCEL_TOKEN` secara lokal. File ini diabaikan Git dan upload. Jangan memakai awalan `NEXT_PUBLIC_`.
2. Commit dan push sumber yang sudah diverifikasi ke repo GitHub.
3. Jalankan `npm run deploy`.

Skrip menggunakan API resmi Vercel, memverifikasi paket **Hobby** sebelum melakukan perubahan, memeriksa commit yang sudah dipush dan secret, membuat build baru, lalu mengunggah **hanya** isi `out/` dan konfigurasi hosting. Deployment tidak memerlukan koneksi GitHub App, fungsi server, storage, atau add-on. Sumber tetap berada di repo GitHub; pembaruan dipublikasikan dengan menjalankan skrip lagi. Identitas proyek/deployment disimpan lokal dalam `.vercel/`.

Skrip berhenti jika paket Hobby tidak tersedia. Jika ada beberapa akun Hobby, tetapkan `VERCEL_TEAM_ID` yang diinginkan di `.env`. Tidak ada perintah untuk upgrade, trial, pembelian domain, atau layanan berbayar.

[Vercel Hobby](https://vercel.com/docs/plans/hobby) gratis untuk penggunaan pribadi/nonkomersial. Situs ini ditujukan untuk proyek edukasi/personal. Halaman yang telah dimuat tetap dapat dipakai saat offline; kunjungan pertama atau reload tanpa jaringan membutuhkan koneksi.

## Sumber menu dan struktur

`public/menu-asli.pdf` adalah salinan dokumen pengguna, halaman 1, tidak diubah. SHA-256: `f6a0694347193982d6e6a2bdcd2ca0f917c5a7f5de5baccc73c614a64ae51e5f`.

Nama yang tidak lazim tetap mengikuti sumber, termasuk Chocolatte, Redvelvet, dan Butterschotch. Harga K dikonversi ke rupiah; harga Corn Ribs Rp25.000 diverifikasi secara visual. Menu tidak menambahkan klaim stok, biaya tambahan, alamat, kontak, atau foto produk.

- `AGENTS.md` / `PRD.md`: aturan kerja dan kriteria penerimaan.
- `DESIGN_DIRECTION.md` / `DESIGN_SYSTEM.md`: keputusan visual.
- `lib/menu.ts`: katalog sumber; `lib/order.ts`: validasi dan perhitungan.
- `app/`: antarmuka; `tests/`: unit dan browser.
- `scripts/deploy.mjs`: deployment statis dengan pemeriksaan paket gratis.

Nama dan catatan dapat dihapus dengan tombol **Pesanan baru** pada ringkasan. Data perangkat juga dapat dihapus melalui pengaturan situs browser.
