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
- `.env` lokal untuk token deployment; tidak diunggah atau dibundel ke browser.
- Repo GitHub privat dibuat melalui `gh`; Vercel Hobby gratis diverifikasi lewat API sebelum deployment.
- Domain bawaan `vercel.app`; tanpa upgrade, trial Pro, add-on, atau domain berbayar.

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
- [ ] Repo privat, commit remote terverifikasi, deployment READY pada Hobby, dan URL produksi teruji.

Target performa: LCP <=2,5 detik, INP <=200ms, CLS <=0,1 pada p75. Pengukuran lab tidak dianggap bukti p75 lapangan.
