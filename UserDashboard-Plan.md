# Rencana Revisi UI & Fungsi: UserDashboard.tsx

Dokumen ini merinci struktur visual, elemen UI, dan fungsi interaktif dari halaman **UserDashboard.tsx** yang akan direvisi untuk mencapai estetika premium, responsivitas tinggi, serta fungsionalitas yang mulus.

---

## 1. Sidebar Navigasi (Sisi Kiri)

### **Visual & Desain**
* **Latar Belakang**: Menggunakan warna solid `bg-surface-container-low` dengan batas halus `border-r border-outline-variant`. Pada resolusi layar kecil (mobile), sidebar akan disembunyikan secara otomatis dan digantikan dengan tombol hamburger.
* **Logo**: Branding **GeoExtract** dengan font `font-hanken` tebal warna `text-primary`.
* **Menu Items**:
  * Menggunakan ikon dari `lucide-react` dengan warna abu-abu `text-on-surface-variant`.
  * **Status Aktif**: Menu yang aktif disorot dengan warna kontras `bg-secondary-container text-on-secondary-container` dan cetak tebal.
  * **Hover Effect**: Transisi halus `duration-200` menjadi warna abu-abu yang lebih terang `bg-surface-container-high` saat disorot kursor.

### **Fungsionalitas**
* **Navigasi Rute**: Berfungsi untuk berpindah tab/halaman utama tanpa memuat ulang browser (menggunakan komponen Router/State).
* **Card Quota & Akun Pengguna**:
  * Menampilkan inisial nama email pengguna dan jenis lisensi keanggotaan (`Free`, `Basic`, `Gold`,`Platinum`).
  * **Bilah Kuota**: Progress bar interaktif yang menunjukkan sisa kuota pencarian (misalnya: `5/5` query harian).
  * **Tombol Upgrade**: Tombol interaktif untuk memicu modal pop-up upgrade paket pembayaran.
* **Log Out**: Tombol untuk membersihkan sesi autentikasi Supabase dan mengarahkan kembali pengguna ke halaman Landing Page`/`.

> [!NOTE]
> **Komentar / Catatan Revisi Sidebar:**
> * Perlu ditambahkan animasi transisi geser (*slide-in/out*) saat sidebar dibuka pada tampilan mobile menggunakan *state* burger menu.
> * Progress bar kuota sebaiknya berubah warna menjadi merah jika kuota tersisa 0 atau 1 untuk memberikan peringatan visual yang lebih jelas.

---

## 2. Header Dashboard (Bagian Atas)

### **Visual & Desain**
* **Struktur**: Menempel di bagian atas (`sticky top-0`) dengan tingkat keburaman latar belakang `bg-surface/80` dan efek kaca buram `backdrop-blur-md` untuk tampilan modern.
* **Elemen**:
  * Judul halaman dinamis sesuai tab aktif.
  * Tombol notifikasi (`Bell`) dengan efek hover melingkar.
  * Indikator lokasi aktif dengan warna ikon aksen primer.

### **Fungsionalitas**
* **Picu Notifikasi**: Tombol notifikasi dapat memicu panel slide-out pemberitahuan terbaru (misal: info kuota habis atau update fitur).

> [!NOTE]
> **Komentar / Catatan Revisi Header:**
> * Integrasikan indikator lokasi (`MapPin`) secara dinamis dengan IP Address user atau biarkan dapat diklik untuk memilih wilayah pencarian *default*.
> * Tambahkan lencana angka merah (*badge count*) di atas ikon `Bell` untuk menandakan notifikasi baru yang belum dibaca.

---

## 3. Panel Pencarian / Ekstraksi Data (Bento Box - Kiri)

### **Visual & Desain**
* **Wadah (Container)**: Kartu putih bersih `bg-surface-container-lowest` bertepi bulat `rounded-xl` dengan bayangan tipis `shadow-sm` dan border halus.
* **Bidang Input (Category & Area)**:
  * Dilengkapi ikon pemandu di sisi kiri (`Search` & `MapPin`).
  * Transisi fokus input dengan border aksen primer dan cincin cahaya halus (`focus:ring-2 focus:ring-primary/20`).
* **Dropdown Radius**: Pilihan rapi dengan ukuran selektor yang ringkas.

### **Fungsionalitas**
* **Validasi Form**: Tombol eksekusi tetap non-aktif (`disabled`) jika input kata kunci atau kota kosong.
* **Eksekusi Scraper**:
  * Mengirimkan permintaan POST ke endpoint Supabase Edge Function `search-maps`.
  * **State Loading**: Menampilkan animasi pemutar (spinner) dan menonaktifkan input untuk mencegah klik ganda selama proses pencarian berlangsung.
  * **Manajemen Kuota**: Memotong kuota kredit pengguna yang terdaftar di database Supabase setelah pencarian berhasil diselesaikan.

> [!NOTE]
> **Komentar / Catatan Revisi Panel Pencarian:**
> * Tambahkan fitur *auto-suggestion* (rekomendasi otomatis) menggunakan Google Places Autocomplete untuk input kolom Area/City agar input lokasi lebih akurat.
> * Buat transisi halus (*expandable form*) yang memungkinkan pengguna melihat parameter lanjutan seperti *rating minimal* atau *hanya tempat yang memiliki nomor telepon*.

---

## 4. Widget Status Sistem & Insights (Bento Box - Kanan)

### **Visual & Desain**
* **Kartu Utama (Health)**: Berwarna aksen kontainer primer `bg-primary-container` dengan ornamen dekoratif ikon `Zap` besar transparan di latar belakang.
* **Kartu Sponsor**: Berwarna abu-abu elegan dengan teks ajakan bertindak (CTA) berwarna kontras dengan garis bawah interaktif.

### **Fungsionalitas**
* **Indikator Koneksi**: Menampilkan lencana hijau berkedip dinamis untuk mengomunikasikan status server secara real-time.
* **Integrasi Tautan**: Mengarahkan pengguna ke tab eksternal untuk verifikasi atau fitur tambahan.

> [!NOTE]
> **Komentar / Catatan Revisi Widget:**
> * Integrasikan status konektivitas dengan fungsi deteksi koneksi internet lokal (`navigator.onLine`) sehingga jika internet terputus, indikator langsung berubah menjadi merah ("Offline").
> * Konten kartu sponsor sebaiknya dapat dikelola melalui admin panel atau menggunakan Google AdSense dinamis berukuran kecil agar menambah pemasukan pasif.

---

## 5. Panel Hasil Ekstraksi (Extracted Results)

### **Visual & Desain**
* **Header Bagian**: Dilengkapi tombol **Export to Excel** dengan ikon unduh (`Download`).
* **Kartu Data Bisnis (Hasil)**:
  * Lencana status hijau cerah bertuliskan `VERIFIED`.
  * Detail terstruktur dengan ikon untuk nomor telepon, alamat, dan bintang rating rating ulasan Google Maps.
  * Tombol aksi ganda di bagian bawah kartu: Tombol WhatsApp berwarna hijau khas (`bg-[#25D366]`) dan tombol peta.
* **Empty State**: Ketika data belum dicari, menampilkan ilustrasi peta melingkar abu-abu-biru yang minimalis.

### **Fungsionalitas**
* **Export Excel**: Mengonversi array state data pencarian menjadi file spreadsheet `.xlsx` menggunakan library `xlsx` dan langsung mengunduh ke komputer pengguna.
* **Integrasi WhatsApp**: Tombol WA secara otomatis memformat nomor telepon (menghapus karakter non-angka) dan mengarahkan pengguna ke tautan chat API `https://wa.me/` di tab baru.
* **Google Maps Redirect**: Membuka peta lokasi bisnis asli melalui tautan `mapsLink`.

> [!NOTE]
> **Komentar / Catatan Revisi Panel Hasil:**
> * Tambahkan fitur pencarian lokal (filter teks) pada hasil ekstraksi agar pengguna bisa memfilter data yang sudah tampil di layar tanpa melakukan scraping ulang.
> * Tombol WhatsApp perlu diberi logika pengecekan: jika nomor telepon tidak valid atau kosong, tombol WA dinonaktifkan (`disabled`) atau disembunyikan untuk menjaga UX tetap bersih.

---

## Rencana Langkah Eksekusi Revisi
1. [ ] Memodifikasi variabel Tailwind dan tema warna agar konsisten di `index.css`.
2. [ ] Memperbarui tata letak tata letak kartu pada `UserDashboard.tsx` agar lebih responsif di layar mobile.
3. [ ] Menambahkan mikro-animasi (hover scale, fade-in transition) pada kartu hasil ekstraksi.
4. [ ] Menyempurnakan manajemen error jika API Supabase membalas dengan status kegagalan.
