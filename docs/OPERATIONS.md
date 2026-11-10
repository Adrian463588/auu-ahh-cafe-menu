# Runbook operasi

## Status layanan

Pada 10 November 2026, proyek Vercel dan deployment publik AUU AHH Cafe dihapus atas permintaan pemilik. Repo GitHub privat dan source aplikasi tetap ada. Tidak ada endpoint produksi, deployment otomatis, atau probe layanan aktif.

Probe harian dan smoke produksi sebelumnya hanya memberi sampling jarang, bukan observabilitas semua request. Target SLO terdahulu bukan target aktif dan tidak boleh dipakai sebagai klaim uptime saat ini. Bukti lama tetap dicatat di `VALIDATION.md` sebagai riwayat.

## Operasi CI

CI berjalan pada pull request dan push `main`. Job **Quality and security gates** memeriksa dependency terkunci, workflow, lint, TypeScript, unit test, audit dependency, production build, integritas source/build, Gitleaks, browser flow, dan aksesibilitas. Workflow hanya mendapat permission `contents: read`; tidak ada secret hosting.

1. Buka run GitHub Actions yang terkait commit/PR dan lihat job pertama yang gagal.
2. Perbaiki lint, tipe, tes, audit, atau scanner pada branch. Jangan menambah `continue-on-error`, memperlebar allowlist, atau mematikan gate agar run hijau.
3. Jika source/hash mismatch, bangun ulang dari commit yang benar; jangan mengedit manifest secara manual.
4. Tinjau PR Dependabot mingguan dan tunggu seluruh gate sebelum merge.

## Mengaktifkan hosting di masa depan

Hanya lakukan jika diminta eksplisit oleh pemilik.

1. Pilih provider/project dan domain yang tepat; pastikan kebutuhan penggunaan cocok dengan paket serta ketentuannya.
2. Buat credential baru dengan hak minimum yang tersedia. Jangan gunakan ulang token yang sudah dicabut.
3. Simpan credential lokal hanya di `.env` yang diabaikan Git; untuk CI gunakan encrypted secret yang hanya tersedia pada job publish tepercaya. Build dan job PR tidak menerima secret.
4. Verifikasi branch, source commit, file artefak, domain, dan status provider sebelum publikasi.
5. Aktifkan smoke check hanya setelah endpoint aktif. Definisikan SLI/SLO dari sinyal yang benar-benar dikumpulkan; jangan klaim uptime dari satu probe atau target.

Vercel menghapus deployment, domain, environment variables, dan pengaturan ketika sebuah proyek dihapus. Untuk sumber resmi dan batasan penghapusan, lihat [Managing projects](https://vercel.com/docs/projects/managing-projects). Pengaktifan hosting kembali memerlukan provisioning baru dan pemeriksaan ulang seluruh setting.
