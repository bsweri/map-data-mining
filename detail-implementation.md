# Alur Program: Data Mining Dashboard

Dokumen ini menjelaskan secara rinci alur kerja program pada halaman **UserDashboard.tsx** dan utilitas pendukungnya di **quota.ts** (URL: `https://bsweri.github.io/map-data-mining/dashboard`).

---

## 1. Inisialisasi & Pengelolaan Sesi (Authentication & Session)
Saat komponen `UserDashboard` pertama kali dimuat, program menggunakan React Context hook `useAuth()` untuk mengambil state autentikasi saat ini:
* **`user`**: Objek pengguna dari sesi Supabase (jika sudah login).
* **`profile`**: Data profil pengguna dari tabel database (mengandung informasi `current_membership`).

**Fungsi terkait:**
- Pengguna yang sudah login dan bertipe _paid_ akan mendapatkan fitur dan batasan yang berbeda dibandingkan pengguna _free_ atau tamu.
- Jika pengguna menekan tombol **Log Out**, fungsi `signOut()` dari konteks dipanggil, sesi dihapus, dan pengguna dialihkan kembali ke halaman utama (`/`).

---

## 2. Sistem Kuota & Status Koneksi (Quota & Network Status)

### a. Manajemen Kuota Harian (`src/lib/quota.ts`)
Dashboard menerapkan pembatasan penggunaan bagi pengguna gratis (_Free_):
- **Pengguna Free:** Sistem memanggil `getLocalQuota()` saat halaman dimuat (dalam `useEffect`). Limit harian default adalah `FREE_DAILY_LIMIT` (10 pencarian). Jumlah pencarian yang sudah dilakukan disimpan di `localStorage` per hari.
- **Pengguna Paid:** Batas kuota diatur lebih besar (misal 100). Saat ini jumlah penggunaan disimulasikan (`setQuotaUsed(15)`).

### b. Pemantauan Koneksi Internet
Dashboard mendeteksi status internet menggunakan event listener window (`online` dan `offline`):
- Variabel state `isOnline` akan bernilai `false` jika pengguna terputus dari internet.
- Jika status berubah menjadi _Offline_, indikator visual sistem (di sisi kanan) berubah menjadi merah, dan tombol pencarian **Run Extraction** otomatis dinonaktifkan untuk menghindari error pengiriman data.

---

## 3. Input Parameter Pencarian (Search Inputs & Filters)
Pengguna dapat mengisi beberapa parameter untuk menentukan target ekstraksi:
1. **Business Category (`keyword`)**: Contoh "Coffee Shop".
2. **Area / City (`location`)**: Contoh "Jakarta Selatan".
3. **Radius**: Area pencarian dalam kilometer (1 hingga 4 KM).
4. **Advanced Options (Opsi Lanjutan)**:
   - **Minimum Rating (`minRating`)**: Filter bisnis berdasarkan rating minimum Google Maps (0 hingga 5 bintang).
   - **Hanya Nomor Telepon (`hasPhoneOnly`)**: Jika dicentang, hanya data yang memiliki nomor kontak valid yang akan diproses dan ditampilkan.

Semua input dikelola menggunakan standard React `useState`. Tombol _submit_ hanya akan aktif jika form kategori, area sudah terisi, dan status koneksi sedang _online_.

---

## 4. Alur Proses Ekstraksi Data (API Request)
Fungsi `handleSearch` dijalankan ketika pengguna menekan tombol **Run Extraction**.

1. **Pengecekan Kuota Awal:** Memastikan limit pengguna Free belum habis dengan memanggil `hasExceededLocalQuota()`. Jika limit habis, eksekusi berhenti dan error ditampilkan.
2. **Persiapan State:** Set `isLoading` menjadi `true`, mengosongkan state `data` lama, dan mereset `error`.
3. **Persiapan Payload:** Menyusun data dalam format JSON berisi parameter pencarian, `user_id` (jika login), `local_id` (untuk tracking free user), `min_rating`, dan `phone_only`.
4. **Permintaan HTTP (Fetch):**
   - Mengirim request `POST` ke endpoint Supabase Edge Function: `https://egtnncvpaznfdzwpbfse.supabase.co/functions/v1/search-maps`
   - Menyertakan token _Authorization Bearer_ di header jika pengguna sedang login.
5. **Pemrosesan Respons:**
   - Jika gagal: Lempar exception dan tampilkan pesan _error_ di antarmuka.
   - Jika berhasil: 
     - Tambah jumlah pemakaian kuota (`incrementLocalQuota()` untuk Free user).
     - Filter tambahan di sisi *client* (meskipun API mungkin sudah memfilternya): Memastikan _minimum rating_ dan ketersediaan nomor telepon (bila _checkbox_ dicentang).
     - Simpan data mentah akhir ke dalam state `data`.
     - Matikan state `isLoading`.

---

## 5. Pemrosesan Hasil dan Pencarian Lokal (Local Search Filtering)
Data hasil ekstraksi tidak langsung di-_render_. Sistem menggunakan variabel perantara `displayedData`:
- Pengguna dapat mengetik di kolom pencarian lokal (`localSearchQuery`).
- `displayedData` akan memfilter state `data` secara langsung di browser tanpa request API baru. 
- Filter lokal ini mencocokkan teks (secara _case-insensitive_) dengan **Nama Bisnis**, **Alamat**, dan **Nomor Telepon**.
- Data dalam `displayedData` inilah yang di-map ke dalam grid bento-style berwujud **Kartu Bisnis**.

---

## 6. Interaksi Pengguna di Hasil (User Interactions)
Setiap Kartu Bisnis di dalam hasil ekstraksi dilengkapi dengan tombol interaktif:
- **Tautan WhatsApp:**
  - Jika tempat tersebut memiliki atribut `phone` yang tidak kosong atau `'-'`, tombol hijau WhatsApp akan aktif.
  - Tautan diformat secara dinamis: `https://wa.me/` diikuti nomor telepon yang hanya berisi angka (dibersihkan menggunakan _Regex_ `replace(/[^0-9]/g, '')`).
- **Tautan Google Maps:**
  - Ikon peta di sebelah tombol WA akan mengarahkan pengguna ke tab baru memuat koordinat asli/link profil tempat tersebut di Google Maps (`place.mapsLink`).

---

## 7. Ekspor Data ke Excel (`handleExport`)
Fungsi `handleExport` bertugas menyimpan data dari tabel ke perangkat lokal:
1. Memastikan state `isExporting` aktif (agar pengguna tidak melakukan klik ganda).
2. Melakukan _mapping_ atas variabel `displayedData` (data hasil yang *sudah difilter lokal*) menjadi format objek sederhana (No, Name, Address, Phone, Radius Zone, Rating, Google Maps URL).
3. Menggunakan library eksternal **`xlsx`** untuk:
   - Membuat *worksheet* data (`json_to_sheet`).
   - Menyesuaikan lebar kolom secara presisi (`worksheet['!cols']`).
   - Menggabungkannya menjadi *workbook*.
4. Men-generate nama file secara otomatis dengan format: `map_data_[keyword_pencarian]_[tanggal].xlsx`.
5. Mengunduh file Excel secara langsung ke mesin klien pengguna.
