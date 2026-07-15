# Dokumentasi AdminLayout

File komponen: `src/pages/admin/AdminLayout.tsx`

`AdminLayout` berfungsi sebagai kerangka navigasi (wrapper) utama untuk semua halaman di dalam area pengelolaan administratif (rute `/admin/*`). Komponen ini dirancang dengan gaya **premium** yang selaras dengan antarmuka _User Dashboard_, mengandalkan efek translusen (_glassmorphism_), animasi transisi yang mulus, dan struktur berbasis Flexbox.

---

## 1. Struktur Kontainer Utama (Main Layout Container)

Seluruh halaman dibungkus menggunakan sebuah _container_ Flexbox untuk menjamin tampilan yang seragam dari ujung ke ujung.
* **Class Utama:** `flex min-h-screen bg-surface text-on-surface font-inter`
* **Pembagian Area:** 
  1. **Sidebar Navigasi** (Tetap di kiri, lebar statis).
  2. **Main Content Area** (Mengambil sisa ruang di sebelah kanan).

---

## 2. Sidebar Navigasi (Sisi Kiri)

Sidebar dikunci posisinya (fixed) agar tidak ikut tergulir (scroll) bersama konten utama.
* **Lebar & Posisi:** Lebar statis `w-64` (256px), menempel di kiri atas (`fixed left-0 top-0 h-screen`).
* **Visual Efek Premium:** Menggunakan latar belakang sedikit transparan dengan efek buram yang tebal (`bg-surface/80 backdrop-blur-xl`), dilengkapi garis pemisah halus dan efek _shadow_ (`border-r border-outline-variant shadow-sm`).

### Komponen Internal Sidebar:

#### A. Header & Logo
* Berisi tautan (link) ke beranda utama dengan ikon `MapPinned` dan teks logo **GeoExtract** (menggunakan font `font-hanken`).
* Ditambah label penanda zona administratif bertuliskan **ADMIN CONSOLE** dengan gaya _uppercase_ (huruf kapital semua) dan jarak antar karakter lebar (`tracking-widest`).

#### B. Navigasi Utama (Navigation Menu)
* Daftar menu utama yang membungkus tautan rute ke:
  1. **Overview** (`/admin`)
  2. **Manage Users** (`/admin/users`)
  3. **Pricing & Quota** (`/admin/pricing`)
  4. **Global Settings** (`/admin/settings`)
* **State Aktif (Active Route):** Komponen ini menggunakan kait (hook) `useLocation` untuk mendeteksi rute aktif. Jika URL saat ini sama dengan URL menu, menu akan berubah warna latar (`bg-secondary-container`) dan teks akan menebal.
* **Animasi Interaktif:** Terdapat efek lompatan lembut ke atas (`hover:-translate-y-0.5`) dengan durasi 300ms setiap kali kursor diarahkan ke daftar menu.

#### C. Kartu Profil Admin (Bottom Area)
* Kotak profil yang diletakkan pada posisi paling bawah sidebar menggunakan `mt-auto`.
* Menampilkan avatar inisial (contoh: "AD") dengan teks status "System Administrator".
* **Gaya Kotak Profil:** Menggunakan `bg-surface-container-lowest` agar terlihat sedikit timbul (berbeda dimensi) dari latar sidebar.

#### D. Footer Sidebar (Support & Logout)
* Dua tombol aksi terakhir yang dibatasi garis tipis.
* **Log Out:** Terintegrasi langsung dengan logika fungsi `signOut` dari Context Authentication (`AuthContext`). Akan mengembalikan _state_ autentikasi pengguna dan me-redirect ke halaman login. Memiliki pewarnaan peringatan merah (`hover:bg-error-container hover:text-on-error-container`) saat disorot.

---

## 3. Main Content Area (Sisi Kanan)

* Menggunakan margin kiri sebesar 256px (`ml-64`) untuk memberikan ruang pada _Sidebar_ statis, sehingga konten tidak tertumpuk di belakang sidebar.
* **Sistem Outlet:** Area ini menampung tag `<Outlet />` dari pustaka `react-router-dom`. Fungsi tag ini adalah me-render konten dinamis dari _child route_ yang dipilih oleh admin (contohnya akan me-render `DashboardOverview` saat di `/admin` atau `ManageUsers` saat di `/admin/users`).
* Area dibatasi pada kontainer maksimum (`max-w-container-max mx-auto`) untuk memastikan antarmuka tetap rapi dan tidak terlalu melebar saat ditampilkan pada monitor berukuran ultra-lebar (*ultrawide*).
