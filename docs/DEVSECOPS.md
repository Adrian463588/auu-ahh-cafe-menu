# Kontrol DevSecOps yang diterapkan

Ruang lingkupnya adalah proyek portofolio statis dengan satu maintainer. Input yang perlu dipercaya: source pada `main`, dependency/tool yang diunduh, artefak antar-job, dan credential deployment. Data nama/catatan pelanggan tetap di browser.

| Risiko | Kontrol | Bukti yang bisa dijalankan |
| --- | --- | --- |
| Credential masuk source/artefak | `.env` diabaikan; encrypted Actions Secret hanya untuk publikasi; Gitleaks dengan redaksi dan rule Vercel tambahan | `npm run security:secrets`, history penuh dan export; smoke jalur privat |
| Supply chain dependency/action | Lockfile, lifecycle scripts instalasi dinonaktifkan, audit semua severity, Actions full commit SHA, binary tool dengan SHA-256 | `npm ci --ignore-scripts`, `npm audit --audit-level=low`, `npm run tools:install` |
| Pipeline atau PR mendapat akses berlebih | `contents: read`, checkout tanpa credential persisten, job deploy terpisah; hanya push `main` terbaru dapat deploy | Kondisi workflow, pemeriksaan event/ref/repo/SHA di skrip deployment |
| Artefak berubah setelah diuji | Artefak immutable Actions; manifest source SHA dan hash setiap file/config; tambahan/perubahan file ditolak | Tes integritas pada `npm test`; `verifyRelease` sebelum upload |
| Gangguan tidak terlihat | Smoke pascapublikasi, probe harian tanpa secret, JSON hasil aktual, runbook pemulihan | Workflow Service health, `npm run smoke`, log kegagalan Actions |

Kontrol tersebut dipilih dari [OWASP Top 10 CI/CD Security Risks](https://owasp.org/projects/top-10-cicd-security-risks), terutama credential hygiene, flow control, pipeline access, dependency chain, artifact integrity, dan visibility.

[GitHub secure use reference](https://docs.github.com/en/actions/reference/security/secure-use) menjadi dasar untuk membatasi permission, memisahkan secret, menghindari eksekusi PR tidak tepercaya dalam konteks berprivilege, dan mengunci action. Repository policy juga membatasi Actions ke penerbit GitHub serta mewajibkan SHA pinning. Dependabot mengusulkan pembaruan npm dan Actions mingguan; tidak ada auto-merge.

[NIST SSDF 1.1](https://csrc.nist.gov/pubs/sp/800/218/final) dipakai sebagai kerangka sederhana: menyiapkan toolchain/gates, melindungi source/credential/artefak, menguji software, lalu merespons temuan dependency atau insiden. Ini pemetaan praktik, bukan audit kepatuhan penuh.

## Keputusan yang perlu diperiksa reviewer

- ESLint memakai versi 10 yang masih didukung dan plugin Next/TypeScript/React Hooks langsung, dengan peer dependency yang kompatibel tanpa `--force`/`--legacy-peer-deps`. Next.js mendokumentasikan penggunaan plugin langsung untuk menghindari konflik konfigurasi. Rujukan: [ESLint version support](https://eslint.org/version-support/) dan [konfigurasi ESLint Next.js](https://nextjs.org/docs/app/api-reference/config/eslint).
- Override `minimatch@>=7 <11.0.1` hanya menarget rentang yang terdampak [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Hapus override bila rantai dependency upstream telah memakai versi patched. Lint, tipe, dan tes memeriksa kompatibilitas override; audit tidak diturunkan severity-nya.
- Dua pengecualian lint pada `set-state-in-effect` dibatasi per baris: pemulihan localStorage setelah static hydration dan feedback kegagalan penulisan storage. Alur tersebut punya tes reload dan storage failure. Aturan security lint tetap aktif.
- Static Next.js memakai inline hydration script, sehingga CSP mengizinkan inline script/style; `object-src`, `base-uri`, frame dan form dibatasi. Tidak ada HTML dari input pengguna yang disisipkan sebagai raw HTML.
- Hash/source binding bukan signed attestation. Probe harian juga bukan observabilitas semua request; rincian SLO ada di runbook.
- Setting repo telah diverifikasi: `main` mewajibkan PR dan **Quality and security gates**, strict checks serta enforce-admins aktif; force-push dan deletion nonaktif. Single-maintainer PR tidak mensyaratkan reviewer kedua. Ketersediaan fitur pada repo lain bergantung pada paket GitHub dan privasinya.
