# Runbook operasi

Layanan: https://auu-ahh-cafe-menu.vercel.app. Pemilik: maintainer repository. State pesanan ada di perangkat pelanggan; deployment tidak mempunyai database atau pembayaran server.

## Sinyal dan target awal

Workflow `Service health` berjalan harian pukul 07:17 WIB dan secara manual. Workflow delivery menjalankan pemeriksaan yang sama sesudah publikasi, ditambah alur browser kasir. Lihat hasil aktual pada artefak `health-*` / `production-proof-*`, berkas `smoke.json`.

SLI: jumlah probe terjadwal yang lulus seluruh pemeriksaan dibagi jumlah probe yang benar-benar dieksekusi dalam 30 hari. SLO awal: >=99% lulus. Anggaran kegagalan: 1% dari probe yang dieksekusi. Target latency sampel: respons HTML <=5000ms, dengan timeout request 10 detik.

Target mengikuti gagasan [Google SRE: Implementing SLOs](https://sre.google/workbook/implementing-slos/). Sampling harian beresolusi rendah dan tidak menghitung downtime di antara probe. Run yang tidak pernah terjadwal tidak masuk denominator; tidak ada klaim uptime atau angka historis yang dibuat-buat. Latency satu probe tidak mewakili p95 atau Core Web Vitals pengguna.

GitHub Actions menampilkan failure sebagai sinyal tindakan; pengiriman email bergantung pada pengaturan notifikasi pengguna GitHub. Tidak ada integrasi chat/email khusus. Hindari menambahkan pesan sukses berulang ke kanal eksternal.

## Saat delivery gagal

1. Buka job pertama yang gagal di Actions. PR dan manual verification tidak mempunyai secret deployment.
2. Jika lint/types/unit/browser/audit/Gitleaks gagal, perbaiki penyebab pada branch dan push kembali. Jangan menambahkan `continue-on-error`, memperlebar allowlist, atau mematikan gate untuk membuat run hijau.
3. Jika hash/source mismatch, buang artefak yang berubah dan buat release melalui CI. Jangan mengedit manifest untuk menyesuaikan perubahan.
4. Jika commit sudah bukan `main` terbaru, jalankan pipeline dari commit terbaru. Penolakan tersebut mencegah publikasi versi lama setelah push baru.
5. Jika paket bukan Hobby atau credential tidak valid, periksa account/token melalui dashboard. Skrip tidak meng-upgrade akun. Jangan mencetak secret untuk debugging.
6. Bila Vercel menolak build/deployment sebelum READY, periksa deployment logs. URL produksi lama biasanya tetap menunjuk release sebelumnya; pastikan langsung dengan smoke, jangan diasumsikan.

## Saat layanan publik gagal

1. Catat waktu, run URL, source commit dari `/build-info.json`, pemeriksaan yang gagal, dan HTTP/latency yang tersedia. Jangan menyalin credential atau nama/catatan pelanggan ke tiket.
2. Jalankan `npm run smoke` untuk memeriksa kembali. Bandingkan status [GitHub](https://www.githubstatus.com/) dan [Vercel](https://www.vercel-status.com/) jika terdapat indikasi gangguan penyedia.
3. Bedakan kegagalan HTML/asset, commit yang tertinggal, PDF berubah, header hilang, private path terbuka, atau timeout jaringan runner. Kegagalan security boundary ditangani segera walaupun halaman utama masih dapat dibuka.
4. Perbaiki melalui branch/PR dan tunggu CI/CD. Setelah publikasi, periksa hasil smoke serta alur kasir.
5. Jika diperlukan pemulihan cepat, gunakan [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback). Pada Hobby, targetnya hanya deployment produksi tepat sebelumnya. Verifikasi URL publik dan catat commit yang dipulihkan. Alternatif terkontrol: `git revert` perubahan bermasalah di branch baru, PR, lalu CI/CD. Jangan rewrite history atau force-push.
6. Rollback menonaktifkan auto-assignment domain produksi. Gunakan **Undo Rollback / Promote** melalui dashboard untuk memulihkan publikasi normal; jangan menganggap push baru langsung mengubah alias. Skrip deployment menolak READY tanpa alias produksi yang diharapkan.
7. Sesudah rollback, monitor commit bisa gagal sampai `main` dan release produksi diselaraskan. Catat pengecualian tersebut dan perbaiki source; jangan menonaktifkan pemeriksaan commit.

## Perawatan rutin

- Tinjau PR Dependabot npm/Actions mingguan, baca perubahan, dan merge setelah gates hijau.
- Tinjau probe yang gagal dan data 30 hari sebelum menyimpulkan target tercapai; kurangi pekerjaan fitur bila anggaran kegagalan terpakai.
- Periksa kuota GitHub Actions serta Vercel Hobby dan hapus artefak kedaluwarsa melalui retention yang telah disetel. Tidak ada paket berbayar yang diaktifkan oleh workflow.
- Setelah insiden, catat dampak nyata, timeline, penyebab berdasarkan bukti, langkah pemulihan, serta satu tindakan pencegahan dengan pemiliknya. Tidak ada contoh insiden atau angka downtime fiktif di repo.
