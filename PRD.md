# AUU AHH Cafe — menu dan pesanan

## Tujuan dan pengguna
Situs sederhana untuk proyek kuliah/personal DevSecOps. Pengunjung, terutama pengguna ponsel, dapat membaca menu asli, memilih varian dan jumlah, lalu menyiapkan ringkasan untuk ditunjukkan ke kasir. Antarmuka berbahasa Indonesia; nama menu mengikuti dokumen.

## Sumber kebenaran
- Dokumen: `Kelompok 1 ( AUU AHH Caffe) .pdf`, halaman 1; sumber asli di folder Downloads pengguna, tidak diubah.
- 32 menu: Milk Based (5), Desserts (3), Snack (3), Main Course (6), Appetizer (1), Squash (4), Coffee Based (10).
- `K` berarti ribuan rupiah. Header Hot/Ice menentukan urutan kedua harga.
- Harga tunggal tidak diberi varian suhu buatan. Corn Ribs Rp25.000; harga diperiksa dari render PDF karena urutan ekstraksi teks tidak andal.
- Tidak tersedia nomor kontak, alamat, jam buka, stok, pajak, biaya layanan, foto produk, atau integrasi pembayaran.
- Pengguna memilih alur: ringkasan pesanan ditunjukkan ke kasir, tanpa nomor kontak.

## Alur utama
1. Buka menu; telusuri kategori atau cari nama menu.
2. Pilih Hot/Ice bila tersedia; tambahkan menu ke keranjang.
3. Ubah jumlah atau hapus; total dihitung dari katalog, bukan harga yang tersimpan di browser.
4. Isi nama pemesan, pilih makan di tempat/bawa pulang, dan catatan opsional.
5. Siapkan ringkasan. Tampilkan rincian, total, identitas, serta instruksi menunjukkan ringkasan ke kasir.
6. Salin atau cetak ringkasan; kembali untuk mengubah pesanan atau mulai pesanan baru.

Pesanan hanya disimpan pada perangkat pengunjung. Penyusunan ringkasan bukan pengiriman atau konfirmasi dari kafe. Tidak ada nomor antrean, estimasi waktu, atau status pembayaran buatan.

## Cakupan dan teknologi
- Next.js App Router + React + TypeScript; CSS biasa dengan semantic tokens.
- Static export; tidak membutuhkan database, server function, API berbayar, akun pelanggan, atau layanan pihak ketiga.
- Keranjang dan detail pemesan tersimpan di localStorage; validasi ulang struktur, ID menu, varian, dan jumlah saat dipulihkan. Nama/catatan tidak dikirim ke server.
- Filter kategori dan pencarian tersimpan di URL agar navigasi Back tetap bermakna.
- Tersedia PDF menu asli untuk referensi, tanpa mengubah dokumen sumber.
- Repo GitHub publik; saat ini CI tidak menggunakan secret deployment.
- Hosting Vercel sebelumnya didecommission pada 10 November 2026; tidak ada endpoint produksi aktif.

## State dan aksesibilitas
- Content: seluruh katalog statis beserta harga; idle: keranjang kosong dengan langkah berikutnya.
- Loading: proses pemulihan keranjang; tidak menunda akses menu.
- Empty: pencarian tidak menemukan menu, dengan tombol reset filter.
- Error: validasi formulir, penyimpanan perangkat tidak tersedia, dan kegagalan salin dengan pemulihan yang jelas.
- Offline: banner koneksi; menu yang sudah dimuat dan ringkasan tetap dapat digunakan. Kunjungan pertama atau muat ulang tanpa jaringan tidak dijamin.
- Semantic HTML, fokus terlihat, dialog native dengan Escape dan pengembalian fokus, live announcement perubahan keranjang.
- Kontras teks minimal 4,5:1; target kontrol 44px; reduced motion dan cetak didukung.

## Rencana eksekusi
1. Buat AGENTS dan PRD, dokumentasikan arah visual dan tokens.
2. Tulis pengujian gagal untuk katalog, varian, pemulihan keranjang, dan total; implementasikan minimum agar lolos.
3. Bangun menu, pencarian/filter, keranjang persisten, formulir, dan ringkasan kasir.
4. Jalankan pemeriksaan tipe, unit, build produksi, browser, responsivitas, dan aksesibilitas; perbaiki masalah.
5. Audit secret; buat repo privat dengan gh; commit/push sumber yang telah diuji.
6. Verifikasi Hobby; deploy sumber yang sama; periksa status READY, HTTP, dan alur produksi.

## Kriteria penerimaan
- [x] 32 item dan seluruh harga cocok dengan PDF halaman 1.
- [x] Hot/Ice memiliki harga tepat; item harga tunggal tetap tunggal.
- [x] Pencarian/kategori, keranjang, jumlah, hapus, total, dan pemulihan bekerja.
- [x] Data localStorage rusak/tidak valid tidak memengaruhi harga atau merusak halaman.
- [x] Nama wajib; catatan opsional; ringkasan akurat dan jelas untuk kasir.
- [x] Salin/cetak dan mulai pesanan baru bekerja; tidak ada klaim pengiriman palsu. CSS cetak diverifikasi; printer fisik tidak diuji.
- [x] Empty, loading, error, offline, keyboard, dan dialog diverifikasi.
- [x] Tidak ada overflow pada lebar 320/375/768/1024/1440px.
- [x] Unit, TypeScript, build, browser, dan audit aksesibilitas lulus.
- [x] Token hanya di `.env` lokal; tidak ada secret pada sumber/aset yang diperiksa. Upload hanya mengambil hasil statis.
- [x] Repo privat, commit remote terverifikasi, deployment READY pada Hobby, dan URL produksi teruji. Lihat `VALIDATION.md`.

Target performa: LCP <=2,5 detik, INP <=200ms, CLS <=0,1 pada p75. Pengukuran lab tidak dianggap bukti p75 lapangan.

## Perluasan: portofolio DevOps / DevSecOps / SRE

Permintaan 6 November 2026: fokus utama proyek adalah proses delivery dan operasi yang sederhana, aman, dapat dijalankan ulang, serta punya bukti GitHub Actions nyata.

Rencana:
1. Rujuk dokumentasi primer GitHub, OWASP CI/CD, NIST SSDF, Google SRE, dan Next.js.
2. Tambahkan ESLint, actionlint, Gitleaks seluruh history/working tree/export, dan audit dependency; jaga isi `.env` di luar log/Git/artefak.
3. CI pada push/PR: dependency terkunci, lint/types/unit, build, browser/axe, security gates. Pin Actions/tools dan batasi permissions.
4. CD hanya sesudah gates lulus pada push `main`: verifikasi artefak/commit, gunakan secret deployment terpisah, cek paket Hobby, dan lakukan smoke test produksi.
5. Tambahkan monitor harian tanpa secret, definisi SLI/SLO awal, serta runbook respons/rollback. Jangan mengarang data uptime atau insiden.
6. Perbarui README, security/operasi, description/topics repo; push; tunggu Actions dan periksa deployment commit yang sama.

Acceptance tambahan:
- [x] `npm run lint` dan actionlint lulus tanpa mengabaikan temuan keamanan secara luas.
- [x] Gitleaks tidak menemukan credential pada seluruh history, sumber saat ini, atau export. Local `.env` diabaikan dan tidak dilayani web.
- [x] CI/CD aktual lulus di GitHub; PR tidak mendapat secret deployment, dan build yang diuji adalah build yang dipublikasikan.
- [x] Deployment otomatis tetap Hobby gratis, dengan pemeriksaan hash/commit serta smoke produksi.
- [x] Health workflow dapat dijalankan; SLO ditulis sebagai target, dengan batas sampling yang jelas.
- [x] README, description, topics, rujukan, dan bukti proses sesuai implementasi yang benar-benar tersedia.

## Status setelah decommission

Pada 10 November 2026, pengguna meminta aplikasi Vercel yang sudah dideploy dihapus. Workflow publikasi dan health terjadwal dihentikan, proyek Vercel dihapus, lalu credential deployment dicabut dari `.env` dan GitHub Actions. Source aplikasi dipertahankan (repo kemudian dipublikasikan pada 25 November 2026 setelah audit DevSecOps serta pembersihan link hosting dan log deploy/health lama); CI tetap memeriksa source/build tanpa mempublikasikan. Checklist deployment di atas adalah bukti historis, bukan status hosting saat ini. Pembuatan hosting baru memerlukan permintaan eksplisit.
