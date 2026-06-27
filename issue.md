# Project Plan: Map Data Mining (Frontend Web App)

## 📌 Deskripsi Proyek
Membangun sebuah aplikasi frontend berbasis web bernama **"Map Data Mining"**. Aplikasi ini berfungsi untuk mencari data lokasi atau bisnis spesifik di suatu area berdasarkan radius tertentu menggunakan Google Maps Platform, lalu menampilkan datanya dalam bentuk grid yang modern, dan memungkinkan pengguna untuk mengekspor data tersebut ke dalam format Excel. 

Aplikasi ini Fullstack menggunakan Supabase. 
---

## 🛠 Teknologi Utama
- **Framework:** React JS
- **Serverless Functions:** Supabase Edge Functions (menggunakan Deno)
- **Styling:** Tailwind CSS
- **Maps Integration:** Google Maps Platform (Places API, Nearby Search API)
- **Export Data:** Library pendukung Excel (misalnya `xlsx` atau library serupa)
- **Monetisasi:** Google AdSense
- **Hosting:** GitHub Pages

---

## 🎨 Panduan UI/UX (Desain)
- **Tema Warna:** Cenderung kebiruan (Blue-ish theme), menggunakan palet warna yang *soft*, modern, dan bersih.
- **Layout:** Menggunakan pendekatan *Mobile-First* agar responsif dan menyesuaikan dengan baik di berbagai ukuran layar (HP, Tablet, Desktop).
- **Proteksi Konten:** Pengguna tidak dapat melakukan *copy* dan *paste* konten yang ada di tampilan antarmuka (UI).
- **Kenyamanan Pengguna (User Friendly):** Navigasi jelas, ada *loading state* saat mengambil data dari API, dan *empty state* saat belum ada pencarian atau data tidak ditemukan.

---

## ⚙️ Spesifikasi Fitur

### 1. Form Input Pencarian
Buat antarmuka form yang terintegrasi dengan parameter Google Maps Platform. Pengguna harus bisa memasukkan:
- **Nama Bisnis / Keyword:** (Misal: "Kopi", "Apotek", "Indomaret").
- **Titik Pusat Pencarian:** (Bisa menggunakan pendeteksi lokasi otomatis pengguna atau input manual letak area).
- **Radius:** Jangkauan pencarian dalam satuan **Kilometer (KM)**.
*Catatan: Pastikan semua parameter input ini valid dan bisa diteruskan dengan baik ke Places API / Nearby Search API.*

### 2. Pengambilan Data (API Fetching)
Gunakan Google Maps API untuk menarik data berdasarkan input pengguna. Data wajib yang harus diekstrak (*fetched*) untuk setiap titik lokasi adalah:
- **Nama Lokasi / Tempat**
- **Alamat Lengkap**
- **No Telepon / Phone Number**
- **Keterangan Zona Radius** (Jarak dari titik pusat pencarian)
- **Link Google Maps** (Tautan URL agar pengguna bisa membuka lokasi langsung di Google Maps)

### 3. Tampilan Hasil (Data Grid)
- Tampilkan data hasil pencarian ke dalam bentuk Grid / Tabel modern.
- Gunakan *styling* Tailwind dengan warna *soft blue*, perhatikan jarak (*padding/margin*) agar data tidak terlihat menumpuk dan mudah dibaca.

### 4. Ekspor ke Excel
- Sediakan tombol khusus dengan desain menarik untuk mengekspor hasil pencarian.
- Saat diklik, data yang ada di dalam Grid akan diubah menjadi format array/JSON dan diunduh sebagai file Excel (`.xlsx`) lengkap dengan kolom yang rapi (Nama, Alamat, No Telepon, Jarak Radius, Link).

---

## 🚀 Tahapan Pengerjaan (High-Level)
1. **Fase 1: Setup & Konfigurasi**
   - Inisialisasi *project* React JS dan integrasikan Tailwind CSS.
   - Siapkan struktur *folder* standar untuk *components*, *services* (untuk API), dan *utils* (untuk export).
2. **Fase 2: UI Development**
   - Buat komponen Header, Search Form (Input & Radius), Data Grid, dan tombol Export.
   - Aplikasikan tema warna biru soft dan pastikan tata letak responsif di semua perangkat.
3. **Fase 3: Integrasi Backend (Supabase Edge Function)**
   - Inisialisasi Supabase secara lokal dan buat Edge Function bernama `search-maps`.
   - Simpan `MAPS_API_KEY` dengan aman di *environment variables* Supabase (tidak lagi menggunakan `.env.local` di *frontend*).
   - Implementasikan fungsi pengambilan data dari Places/Nearby Search API dan Details API di dalam Edge Function menggunakan Deno.
   - Panggil endpoint Edge Function dari komponen frontend dan *mapping* hasilnya ke *state* yang dirender oleh Data Grid.
4. **Fase 4: Fitur Ekspor & Finishing**
   - Implementasikan library `xlsx` untuk mengonversi *state* hasil pencarian menjadi file Excel.
   - Lakukan pengujian sederhana (*handling error* jika API gagal, memastikan data hilang saat halaman *refresh*, dan cek responsivitas UI).

---

## ✅ Acceptance Criteria (Kriteria Selesai)
- [ ] UI tampil modern dengan tema biru soft, tampilan yang user friendly.
 dan responsif di mobile & desktop.
- [ ] Pengguna dapat memasukkan nama bisnis disuatu wilayah, dan radius (KM).
- [ ] Aplikasi berhasil memanggil Google Maps API dan merender Nama, Alamat, Telepon, Keterangan Radius, dan Link Gmaps ke dalam tabel/grid.
- [ ] Tombol *Export Excel* berfungsi dengan baik dan menghasilkan file berformat `.xlsx` yang bisa dibaca.
- [ ] Tidak menggunakan database (data hilang saat *reload*).
- [ ] Kunci API Google Maps tidak diekspos di sisi *client* (menggunakan *environment variable* di Supabase Edge Function).