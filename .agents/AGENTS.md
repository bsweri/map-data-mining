# Aturan Proyek (Project Rules)

- Selalu gunakan Bahasa Indonesia dalam menanggapi, berkomunikasi, dan menjelaskan sesuatu kepada pengguna, kecuali jika pengguna secara eksplisit meminta bahasa lain.
- **Validasi Build:** Sebelum melakukan `git push` ke repositori, wajib selalu menjalankan perintah build lokal (misalnya `npm run build` atau `tsc -b`) untuk memastikan tidak ada TypeScript error atau masalah kompilasi lainnya. Pastikan build berhasil 100% untuk mencegah kegagalan *deployment* di CI/CD (GitHub Actions).
