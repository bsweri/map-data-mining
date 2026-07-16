# Detail Layout Landing Page

Halaman utama (Landing Page) saat ini dibangun di [Home.tsx](file:///d:/ERI/Others/Github/map-data-mining/src/pages/Home.tsx) dan didukung oleh styling CSS Tailwind. Berikut adalah detail struktur layout halaman depan yang berjalan saat ini:

## 1. Top Navigation Bar (Header)
*   **Komponen:** `<Header />`
*   **Posisi:** Tetap di bagian atas (`fixed top-0 w-full z-50`), tinggi 16 (`h-16`).
*   **Isi:**
    *   Logo/Nama Aplikasi: `GeoExtract` (warna `primary`, klik mengarah ke Home).
    *   Menu Navigasi (Desktop): Link ke Home, Pricing, FAQ, Contact, dan Dashboard.
    *   Tombol Autentikasi:
        *   Jika belum login: Tombol "Login" (outline) dan "Sign Up" (filled).
        *   Jika sudah login: Tombol "Go to Dashboard" (filled) dan menu profile.

---

## 2. Hero Section
*   **Posisi:** Di bawah header (`pt-20 pb-12 px-gutter`).
*   **Isi:**
    *   **Headline Utama:** *"Extract Google Maps business data within a specific radius into Excel in one click."* dengan penekanan warna `primary` pada kalimat *"in one click."*
    *   **Subheadline:** Deskripsi singkat tentang geospatial data mining untuk riset pasar, analisis kompetitor, dan lead generation.
    *   **AdSense Banner (Top):** Slot iklan atas untuk optimasi monetisasi (Leaderboard Top).

---

## 3. Main Workspace (Grid Layout - 2 Kolom)
Membagi halaman menjadi dua kolom besar pada layar desktop (`grid grid-cols-1 lg:grid-cols-12 gap-8`):
*   **Kolom Kiri/Utama (`lg:col-span-8`)** - Area Pencarian dan Hasil.
*   **Kolom Kanan/Sidebar (`lg:col-span-4`)** - Area Donasi & Statistik.

### A. Kolom Kiri/Utama (Extraction Area)
1.  **Form Pencarian (`SearchForm`):**
    *   Input Kata Kunci (*Keyword*, ex: "Coffee Shop").
    *   Input Lokasi (*Location*, ex: "Jakarta").
    *   Pilihan Radius (dalam meter, km, dsb).
    *   Tombol "Extract Data".
2.  **Pesan Error / Validasi:**
    *   Menampilkan pesan jika pencarian gagal atau jika pengguna *free* telah melampaui kuota harian.
3.  **Preview Hasil Pencarian (`DataGrid` & `ExportButton`):**
    *   *Jika data berhasil diambil:* Menampilkan daftar bisnis hasil ekstraksi beserta tombol untuk ekspor ke Excel/CSV.
    *   *Jika belum ada pencarian (default):* Menampilkan **Mock Extraction Preview** (2 buah kartu mock "The Roasting Point" dan "Studio Caffeine") untuk memberikan gambaran UI kepada calon pengguna baru.
4.  **AdSense Banner (Mid-Content):** Iklan di tengah halaman sebelum bagian pricing.
5.  **Pricing Packages (`PricingPackages`):** Daftar paket harga langganan (Free, Starter, Pro).

### B. Kolom Kanan/Sidebar (Support & Stats Area)
1.  **PayPal Donation Card:**
    *   Form input nominal donasi (min. Rp 10.000).
    *   Tombol "Pay with PayPal".
    *   Sebagai alternatif monetisasi/support untuk biaya server.
2.  **Mining Statistics Card:**
    *   Menampilkan data statistik global aplikasi:
        *   *Global Extractions:* 12.4K+
        *   *Data Accuracy:* 99.2%
        *   *Active Analysts:* 850+

---

## 4. Footer
*   **Komponen:** `<Footer />`
*   **Posisi:** Bagian terbawah halaman.
*   **Isi:** Informasi hak cipta, link tambahan, dan syarat & ketentuan.

---

> [!NOTE]
> Layout ini dirancang responsif, di mana sidebar donasi dan statistik akan turun ke bagian bawah (di bawah Workspace utama) jika dibuka menggunakan perangkat mobile.

Silakan beri tahu bagian mana dari layout ini yang ingin Anda ubah atau sesuaikan!
