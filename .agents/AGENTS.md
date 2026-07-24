# Aturan Proyek (Project Rules)

- Selalu gunakan Bahasa Indonesia dalam menanggapi, berkomunikasi, dan menjelaskan sesuatu kepada pengguna, kecuali jika pengguna secara eksplisit meminta bahasa lain.
- **Validasi Build:** Sebelum melakukan `git push` ke repositori, wajib selalu menjalankan perintah build lokal (misalnya `npm run build` atau `tsc -b`) untuk memastikan tidak ada TypeScript error atau masalah kompilasi lainnya. Pastikan build berhasil 100% untuk mencegah kegagalan *deployment* di CI/CD (GitHub Actions).
- **Edge Function Deploy:** Setelah melakukan perubahan/modifikasi pada skrip Edge Function Supabase (seperti `index.ts`), pastikan untuk selalu langsung mengeksekusi perintah deploy (`cmd /c npx supabase functions deploy <nama-fungsi>`) secara otomatis agar perubahannya masuk ke server!
- **Kompilasi Otomatis:** Lakukan validasi kompilasi (`cmd /c npm run build` atau `tsc -b`) setiap kali selesai mengubah file `.tsx` atau `.ts`. Jangan menunggu aba-aba atau perintah `git push`.
- **Konfirmasi Otomatis:** Jika saat mengeksekusi sesuatu muncul pertanyaan atau konfirmasi antara "Reject all" atau "Accept all" (atau serupa), otomatis pilih "Accept all" (setujui semua) tanpa perlu bertanya ke pengguna.

