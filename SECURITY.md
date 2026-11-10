# Security policy

Scope proyek ini: source aplikasi, pipeline verifikasi GitHub Actions, dependency, dan artefak build. Hosting Vercel telah dihapus dan pipeline tidak memiliki secret deployment. Menu berasal dari dokumen pengguna; data pesanan hanya berada di localStorage perangkat pengunjung.

- Credential Vercel yang dipakai sebelumnya telah dicabut dari `.env` dan GitHub Actions setelah decommission. Tidak ada token hosting aktif pada repo ini.
- Jangan menaruh credential, private key, dump environment, atau isi pesanan pada issue, PR, log, screenshot, atau artefak. Scanner selalu meredaksi temuan.
- Gitleaks memeriksa seluruh history reachable, file tracked saat ini, dan export publik. Audit npm menggagalkan pipeline pada severity low ke atas. Temuan harus diperbaiki, bukan ditutupi dengan allowlist umum.
- Dependabot dijadwalkan untuk dependency npm dan Actions; maintainer tetap memeriksa serta menguji pembaruan.
- Untuk melaporkan temuan, hubungi maintainer melalui mekanisme pelaporan privat GitHub yang tersedia pada repository/account. Jangan mempublikasikan material credential atau data sensitif pada issue. Repo ini tidak mengarang alamat kontak keamanan.

Jika credential benar-benar terpapar: cabut/rotasi pada penerbitnya terlebih dahulu, periksa audit log, lalu tangani source/history dengan rencana yang menjaga bukti. Menghapus baris pada commit terbaru tidak mencabut token. Perubahan riwayat Git memerlukan otorisasi tersendiri. Hosting baru hanya boleh diaktifkan kembali atas permintaan eksplisit dengan credential baru.

Rujukan: [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet) dan [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use).
