# Detail Komponen Layout: UserDashboard.tsx

Dokumen ini merinci struktur antarmuka pengguna (UI) dan pembagian komponen layout pada halaman **UserDashboard.tsx**. Gunakan dokumen ini sebagai acuan saat merevisi desain dan struktur komponen.

---

## 1. Kontainer Utama (Main Layout Container)
Seluruh halaman dibungkus dalam kontainer _flexbox_ untuk memastikan tampilan yang utuh dari ujung ke ujung.
* **Class Utama:** `min-h-screen bg-surface text-on-surface font-inter flex`
* **Elemen:** Sidebar (Kiri) dan Main Content Area (Kanan).

---

## 2. Sidebar Navigasi (Sisi Kiri)
Sidebar berfungsi sebagai menu navigasi utama dan kontrol akun.

* **Responsivitas:** 
  - Desktop: Sidebar tetap (*fixed*) berukuran lebar `64` (256px).
  - Mobile: Disembunyikan (posisi `translate-x-full`) dan memunculkan *overlay* hitam semi-transparan.
* **Elemen Internal:**
  1. **Header Logo:** Menampilkan teks "GeoExtract" menggunakan font Hanken Grotesk.
  2. **Navigasi Tab:** Kumpulan tautan menu (Overview, Analytics, Extraction, dll) berbentuk daftar vertikal dengan _hover effect_. Menu aktif (Extraction) disorot menggunakan warna `bg-secondary-container`.
  3. **Profil & Kuota (Bawah Navigasi):**
     - Kotak informasi pengguna dengan inisial avatar.
     - Progress Bar kuota yang indikator warnanya berubah merah jika sisa kuota ≤ 1.
     - Tombol "Upgrade Plan".
  4. **Footer Sidebar:** Menu *Support* dan *Log Out*.

---

## 3. Main Content Area (Sisi Kanan)
Area konten utama mengambil sisa lebar layar dan bergeser pada tampilan desktop (`md:ml-64`).

### A. Header Atas (Top Header)
* **Visual:** Menempel di atas (`sticky top-0`) dengan efek kaca buram (`backdrop-blur-md`).
* **Elemen Kiri:** 
  - Tombol Hamburger (Hanya muncul di Mobile) untuk membuka Sidebar.
  - Judul Halaman ("Data Mining Dashboard").
* **Elemen Kanan:** 
  - Tombol Notifikasi (Ikon Lonceng) dengan _badge_ merah yang berkedip (*animate-pulse*).
  - Garis pemisah (`divider`).
  - Indikator lokasi aktif (Misal: "Jakarta, ID").

---

### B. Dashboard Content (Bento Box Layout)
Konten inti menggunakan struktur grid bergaya *bento box* (`grid-cols-1 md:grid-cols-12`).

#### B.1. Panel Pencarian / Ekstraksi Data (`md:col-span-8`)
Panel formulir ekstraksi utama.
* **Header Kartu:** Judul "New Extraction" dan deskripsi.
* **Input Grup:** Menggunakan 2 kolom grid pada mode tablet/desktop.
  - Bidang `Business Category` (dengan ikon *Search* di dalam input).
  - Bidang `Area / City` (dengan ikon *MapPin* di dalam input).
* **Dropdown Advanced Options:** 
  - Dapat di-klik untuk membuka/menutup parameter tambahan.
  - Slider (Range Input) untuk *Minimum Rating*.
  - Checkbox untuk opsi *Hanya nomor telepon saja*.
* **Bottom Action:** 
  - Dropdown Radius (1 KM - 4 KM).
  - Tombol Submit "Run Extraction" yang responsif terhadap state `isLoading` (menampilkan spinner saat berputar).

#### B.2. Widget Status Sistem & Insights (`md:col-span-4`)
Berada di sisi kanan form pencarian pada tampilan Desktop.
* **Kartu Extraction Health:**
  - Latar berubah dinamis bergantung state `isOnline` (Biru untuk _Online_, Merah/Pink untuk _Offline_).
  - Terdapat ornamen ikon petir raksasa transparan di belakang teks.
* **Kartu Sponsored Insights:**
  - Tempat menaruh Iklan atau Call To Action (CTA) premium, seperti verifikasi API.

---

### C. Panel Extracted Results
Bagian ini mengatur tampilan data yang dikembalikan oleh API.

* **Header Panel Hasil:**
  - Judul "Extracted Results" beserta lencana _badge count_ jumlah data.
  - Fitur bar kanan: Input pencarian lokal ("Cari di hasil...") dan Tombol "Export to Excel".
* **State Ketika Ada Hasil (Grid Layout):**
  - Menggunakan Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  - **Kartu Bisnis (Result Card):**
    - **Header:** Nama tempat, kategori bisnis, dan tag _VERIFIED_.
    - **Body:** Informasi kontak (Telepon, Alamat, dan Bintang Rating) berlatar biru pucat.
    - **Footer (Aksi):** Tombol WhatsApp besar berwarna hijau dan Tombol ikon Google Maps.
* **State Kosong (Empty State):**
  - Kotak besar dengan pesan sentral dan Ikon MapPin.
  - Pesan teks dinamis bergantung pada apakah karena pencarian lokal tidak cocok, atau karena ekstraksi belum pernah dijalankan.

---

### D. Bottom Placeholder & Footer
* **AdSense Placeholder:** Kotak putus-putus untuk menempatkan _banner_ periklanan berukuran *leaderboard* (`728x90`).
* **Footer Utama:** 
  - Garis batas dan teks _Copyright_ di bagian paling bawah.
