# 🏗️ Arsitektur Proyek: GeoExtract

> **GeoExtract** adalah platform SaaS B2B Lead Generation yang mengotomatisasi ekstraksi kontak bisnis menggunakan Google Maps API. Platform ini memungkinkan pengguna mencari dan mengekspor data bisnis (nama, telepon, alamat, rating) berdasarkan kategori dan lokasi tertentu.

---

## Daftar Isi

1. [Gambaran Umum Arsitektur](#1-gambaran-umum-arsitektur)
2. [Frontend Stack](#2-frontend-stack)
3. [Backend Stack](#3-backend-stack)
4. [Database Schema](#4-database-schema)
5. [Integrasi Pembayaran](#5-integrasi-pembayaran)
6. [Internationalization i18n](#6-internationalization-i18n)
7. [DevOps dan CI/CD](#7-devops-dan-cicd)
8. [Tooling dan Code Quality](#8-tooling-dan-code-quality)
9. [Struktur Direktori](#9-struktur-direktori)
10. [Alur Data Sistem](#10-alur-data-sistem)
11. [Sistem Peran dan Akses RBAC](#11-sistem-peran-dan-akses-rbac)
12. [Sistem Kuota dan Monetisasi](#12-sistem-kuota-dan-monetisasi)

---

## 1. Gambaran Umum Arsitektur

Proyek ini menggunakan arsitektur **Jamstack** (JavaScript, APIs, Markup) dengan pemisahan yang tegas antara frontend dan backend:

```
+--------------------------------------------------------------+
|                          FRONTEND                            |
|    React 19 + TypeScript + Vite  (GitHub Pages)              |
|    URL: https://bsweri.github.io/map-data-mining/            |
+------------------------------+-------------------------------+
                               |
                          HTTPS / REST / JWT
                               |
+------------------------------v-------------------------------+
|                      BACKEND (Supabase)                      |
|  +-----------------+  +------------------+  +-------------+ |
|  |   Auth (JWT)    |  |   PostgreSQL 17  |  |    Edge     | |
|  |    + RLS        |  |   (Database)     |  |  Functions  | |
|  +-----------------+  +------------------+  | (Deno/TS)   | |
|                                             +-------------+ |
+------------------------------+-------------------------------+
                               |
                    Webhook / External API Calls
                               |
+------------------------------v-------------------------------+
|                      EXTERNAL SERVICES                       |
|  +----------------------+  +------------------------------+  |
|  |       Midtrans       |  |        LemonSqueezy          |  |
|  |   (IDR / Indonesia)  |  |    (USD / International)     |  |
|  +----------------------+  +------------------------------+  |
|  +----------------------------------------------------------+ |
|  |           Google Maps / Places API                       | |
|  +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

---

## 2. Frontend Stack

### 2.1 React 19

- **Versi:** `^19.2.7`
- **Peran:** Library utama untuk membangun antarmuka pengguna (UI) berbasis komponen.
- **Mengapa digunakan:**
  - Arsitektur berbasis komponen memungkinkan pengembangan UI yang modular dan reusable (misalnya: `SearchForm`, `DataGrid`, `ExportButton`).
  - React Hooks (`useState`, `useEffect`, `useContext`) mengelola state dan siklus hidup komponen secara efisien.
  - React 19 menghadirkan peningkatan performa rendering dan fitur terbaru seperti `use()` hook.
  - Ekosistem yang sangat besar memudahkan integrasi dengan library seperti Supabase, i18next, dan xlsx.

### 2.2 TypeScript ~6.0.2

- **Versi:** `~6.0.2` (Development dependency)
- **Peran:** Superset dari JavaScript yang menambahkan sistem tipe statis.
- **Mengapa digunakan:**
  - Mencegah bug runtime dengan deteksi error sejak fase kompilasi (misalnya: tipe data `MapPlace`, `Profile`, `AuthContextType` sudah didefinisikan di `types.ts`).
  - IntelliSense yang lebih kaya di IDE (autocomplete, refactoring aman).
  - `tsconfig.app.json` dikonfigurasi ketat: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` aktif untuk menjaga kualitas kode.
  - Target kompilasi `ES2023` memastikan kode memanfaatkan fitur JavaScript modern.

### 2.3 Vite 8

- **Versi:** `^8.1.0`
- **Peran:** Build tool dan development server yang sangat cepat.
- **Mengapa digunakan:**
  - **Hot Module Replacement (HMR)** yang instan selama pengembangan — perubahan kode langsung terlihat di browser tanpa reload penuh.
  - Build produksi dioptimalkan otomatis (code splitting, tree shaking, minifikasi).
  - Konfigurasi sederhana melalui `vite.config.ts` dan mendukung plugin ekosistem yang kaya.
  - `base: '/map-data-mining/'` dikonfigurasi untuk deployment ke GitHub Pages dengan subdirectory.

### 2.4 Tailwind CSS v4

- **Versi:** `^4.3.1`
- **Peran:** Utility-first CSS framework untuk styling komponen UI.
- **Mengapa digunakan:**
  - Memungkinkan pembuatan desain kompleks (glassmorphism, dark mode, responsive grid, animasi) langsung di dalam JSX tanpa berpindah ke file CSS terpisah.
  - Diintegrasikan melalui **plugin Vite** (`@tailwindcss/vite`), bukan PostCSS tradisional — lebih cepat dan terintegrasi native dengan pipeline build Vite.
  - Tailwind v4 menggunakan pendekatan CSS-first configuration (via `@theme`) yang lebih modern dari v3.
  - Kelas utilitas menghasilkan CSS minimal — hanya kelas yang digunakan di kode yang akan di-bundle ke produksi.

### 2.5 React Router DOM v7

- **Versi:** `^7.18.0`
- **Peran:** Library routing untuk navigasi Single Page Application (SPA).
- **Mengapa digunakan:**
  - Memungkinkan navigasi antar halaman (Home, Login, Dashboard, Admin) tanpa reload browser penuh.
  - **Nested Routes** digunakan untuk panel Admin (`/admin`, `/admin/users`, `/admin/pricing`, dll) yang berbagi layout `AdminLayout`.
  - Komponen `ProtectedRoute` dibungkus di atas rute sensitif untuk proteksi autentikasi dan otorisasi role-based.

### 2.6 @react-google-maps/api

- **Versi:** `^2.20.8`
- **Peran:** Wrapper React untuk Google Maps JavaScript API.
- **Mengapa digunakan:**
  - Memberikan komponen React-native untuk menampilkan peta interaktif.
  - Mendukung integrasi dengan Places API untuk fitur auto-suggestion lokasi.
  - Digunakan untuk memvisualisasikan hasil ekstraksi data pada peta dan mendukung input lokasi yang akurat.

### 2.7 @supabase/supabase-js

- **Versi:** `^2.108.2`
- **Peran:** Supabase Client SDK untuk frontend.
- **Mengapa digunakan:**
  - Menyediakan satu client (`supabase`) di `src/lib/supabase.ts` yang diinisialisasi sekali dan digunakan di seluruh aplikasi.
  - Mengelola autentikasi (login, register, session persistence) menggunakan JWT secara otomatis.
  - Query database PostgreSQL langsung dari frontend dengan **Row Level Security (RLS)** yang memastikan setiap pengguna hanya dapat mengakses data miliknya sendiri.

### 2.8 lucide-react

- **Versi:** `^1.21.0`
- **Peran:** Library ikon SVG berbasis komponen React.
- **Mengapa digunakan:**
  - Ribuan ikon SVG yang konsisten dan dapat dikustomisasi ukuran/warnanya melalui props.
  - Tree-shakeable — hanya ikon yang di-import yang masuk ke bundle produksi, menjaga ukuran bundle tetap kecil.
  - Digunakan di seluruh aplikasi: ikon navigasi sidebar, tombol aksi, status indikator, dll.

### 2.9 xlsx

- **Versi:** `^0.18.5`
- **Peran:** Library untuk membaca dan menulis file spreadsheet Microsoft Excel (.xlsx).
- **Mengapa digunakan:**
  - Fitur inti GeoExtract adalah ekspor data ke Excel — library ini memungkinkan pembuatan file `.xlsx` langsung di browser (client-side) tanpa perlu server.
  - Mendukung pembuatan worksheet, kustomisasi lebar kolom (`worksheet['!cols']`), dan auto-download via `writeFile`.
  - Format nama file dinamis: `map_data_[keyword]_[tanggal].xlsx`.

---

## 3. Backend Stack

### 3.1 Supabase

- **Project ID:** `LookinMaps`
- **URL:** `https://egtnncvpaznfdzwpbfse.supabase.co`
- **Peran:** Backend-as-a-Service (BaaS) yang menggantikan kebutuhan server Node.js/backend kustom.
- **Mengapa digunakan:**
  - **All-in-one platform:** Menyatukan database (PostgreSQL), autentikasi, storage, dan serverless functions dalam satu ekosistem terintegrasi.
  - **Managed service:** Tidak perlu mengelola server, scaling, atau infrastruktur database secara manual.
  - **Row Level Security (RLS):** Lapisan keamanan level database yang memastikan data terisolasi per pengguna — tanpa perlu menulis middleware autentikasi kustom.
  - **Real-time subscriptions** tersedia untuk notifikasi dan pembaruan data live.

### 3.2 Supabase Auth

- **Mekanisme:** JWT (JSON Web Token)
- **Peran:** Mengelola seluruh siklus autentikasi pengguna.
- **Cara kerja di proyek:**
  - `AuthContext.tsx` mendengarkan perubahan status auth melalui `supabase.auth.onAuthStateChange()`.
  - Sesi disimpan otomatis di `localStorage` oleh Supabase SDK.
  - Trigger PostgreSQL `handle_new_user()` otomatis membuat baris di tabel `profiles` setiap kali pengguna baru mendaftar.

### 3.3 Supabase Edge Functions (Deno Runtime)

- **Runtime:** Deno (TypeScript-native, V8 Isolates)
- **Peran:** Serverless functions untuk logika bisnis yang sensitif (tidak boleh di-expose ke client).
- **Functions yang ada:**

| Function | Deskripsi |
|---|---|
| `search-maps` | Memanggil Google Maps/Places API, memfilter hasil, dan melogging penggunaan API |
| `create-midtrans-transaction` | Membuat transaksi pembayaran Midtrans dan mengembalikan token Snap |
| `midtrans-webhook` | Menerima notifikasi pembayaran dari Midtrans dan memperbarui status membership |
| `lemonsqueezy-webhook` | Menerima notifikasi pembayaran dari LemonSqueezy dan memperbarui status membership |

- **Mengapa Deno / Edge Functions:**
  - Secret API keys (Google Maps, Midtrans, LemonSqueezy) tersimpan aman di environment variables server-side, tidak terekspos ke browser.
  - Cold start yang sangat cepat dibanding Lambda/Cloud Functions tradisional.
  - Deploy otomatis bersama Supabase project.

### 3.4 PostgreSQL 17

- **Versi database:** 17 (dikonfigurasi di `supabase/config.toml`)
- **Peran:** Database relasional utama yang menyimpan semua data aplikasi.
- **Mengapa digunakan:**
  - Terintegrasi native dengan Supabase (semua fitur Supabase dibangun di atas PostgreSQL).
  - **ENUM types** (`app_role`, `membership_level`) memastikan integritas data membership.
  - **JSONB** digunakan di tabel `global_settings` untuk penyimpanan konfigurasi yang fleksibel.
  - **Triggers & Functions** PostgreSQL (`handle_new_user`) mengotomatisasi pembuatan profil pengguna.
  - **Migrasi skema** dikelola secara versioned di folder `supabase/migrations/` (13 file migrasi).

---

## 4. Database Schema

```
+---------------+       +----------------------+       +------------------+
|  auth.users   |------>|       profiles       |       | membership_plans |
|  (Supabase)   |       |                      |       |                  |
|               |       | - id (PK, FK)        |       | - id (PK)        |
| - id          |       | - email              |       | - level (ENUM)   |
| - email       |       | - role (ENUM)        |       | - price_idr      |
| - password    |       | - current_membership |       | - price_usd      |
+---------------+       | - membership_expires |       | - daily_quota    |
                        | - credits            |       | - monthly_quota  |
                        +----------+-----------+       +------------------+
                                   |
               +-------------------+-------------------+
               |                   |                   |
               v                   v                   v
    +------------------+  +----------------+  +--------------------+
    |   transactions   |  | api_usage_logs |  | contact_messages   |
    |                  |  |                |  |                    |
    | - user_id (FK)   |  | - user_id (FK) |  | - name             |
    | - gateway        |  | - endpoint     |  | - email            |
    | - amount         |  | - ip_address   |  | - message          |
    | - currency       |  | - city/country |  | - status           |
    | - plan_level     |  +----------------+  +--------------------+
    | - status         |
    +------------------+

    +-------------------+
    |  global_settings  |
    |                   |
    | - setting_key     |
    | - setting_value   |
    |   (JSONB)         |
    +-------------------+
```

**Tabel-tabel Database:**

| Tabel | Fungsi |
|---|---|
| `profiles` | Data profil pengguna, role, dan level membership |
| `membership_plans` | Konfigurasi harga dan kuota setiap paket (Free, Silver, Gold, Platinum) |
| `transactions` | Riwayat transaksi pembayaran (Midtrans & LemonSqueezy) |
| `api_usage_logs` | Log penggunaan API oleh pengguna (untuk audit dan rate limiting) |
| `global_settings` | Konfigurasi aplikasi global yang dapat diubah admin (JSONB) |
| `contact_messages` | Pesan dari form "Contact Us" yang masuk ke Inbox admin |

---

## 5. Integrasi Pembayaran

### 5.1 Midtrans (Pembayaran IDR — Indonesia)

- **Peran:** Payment gateway utama untuk pasar Indonesia dengan mata uang Rupiah (IDR).
- **Mengapa digunakan:**
  - Mendukung metode pembayaran lokal Indonesia: transfer bank (BCA, Mandiri, BNI, BRI), GoPay, OVO, QRIS, Alfamart, Indomaret, dan kartu kredit.
  - Integrasi via **Midtrans Snap** — popup pembayaran yang sudah di-host oleh Midtrans, meminimalkan risiko keamanan karena data kartu kredit tidak pernah menyentuh server kita.
  - Window global `snap.pay(token)` dipanggil dari frontend setelah mendapatkan token dari Edge Function `create-midtrans-transaction`.
- **Alur:**
  1. User memilih paket → Frontend memanggil Edge Function `create-midtrans-transaction`.
  2. Edge Function membuat order di Midtrans dengan secret key server-side → Mendapat Snap Token.
  3. Frontend memanggil `window.snap.pay(token)` untuk membuka popup pembayaran.
  4. Midtrans mengirim notifikasi ke Edge Function `midtrans-webhook` setelah pembayaran selesai.
  5. Webhook memperbarui `transactions` dan `profiles.current_membership` di database.

### 5.2 LemonSqueezy (Pembayaran USD — Internasional)

- **Peran:** Payment platform untuk pasar internasional dengan mata uang US Dollar (USD).
- **Mengapa digunakan:**
  - **Merchant of Record** — LemonSqueezy bertanggung jawab atas pajak (VAT, GST) di berbagai negara, mengurangi beban compliance yang kompleks.
  - Mendukung kartu kredit internasional, Apple Pay, Google Pay.
  - Webhook-based notification untuk update status pembayaran.
- **Alur:** Serupa dengan Midtrans, namun menggunakan webhook `lemonsqueezy-webhook` sebagai penerima notifikasi.

---

## 6. Internationalization i18n

### i18next + react-i18next + i18next-browser-languagedetector

- **Versi:** `i18next ^26.3.3`, `react-i18next ^17.0.8`, `i18next-browser-languagedetector ^8.2.1`
- **Peran:** Framework internasionalisasi untuk mendukung multi-bahasa.
- **Mengapa digunakan:**
  - GeoExtract menyasar pasar Indonesia dan internasional — i18n memungkinkan UI tampil dalam **Bahasa Indonesia (id)** dan **Bahasa Inggris (en)**.
  - `i18next-browser-languagedetector` secara otomatis mendeteksi bahasa browser pengguna dan menerapkan terjemahan yang sesuai.
  - File terjemahan disimpan di `src/locales/en/translation.json` dan `src/locales/id/translation.json`.
  - Komponen `LanguageCurrencySwitcher.tsx` memungkinkan pengguna berganti bahasa secara manual.
  - Terintegrasi dengan sistem pembayaran: bahasa UI juga mempengaruhi currency yang ditampilkan (IDR atau USD).

---

## 7. DevOps dan CI/CD

### 7.1 GitHub Actions

- **File konfigurasi:** `.github/workflows/deploy.yml`
- **Peran:** Automation pipeline untuk build dan deployment otomatis.
- **Mengapa digunakan:**
  - Setiap push ke branch `main` atau `master` secara otomatis memicu pipeline deployment.
  - **Pipeline steps:**
    1. Checkout kode repository.
    2. Setup Node.js versi 20.
    3. Install dependencies (`npm ci` — reproducible install dari `package-lock.json`).
    4. Build produksi (`npm run build` = TypeScript compile + Vite bundle).
    5. Upload artifact ke GitHub Pages.
    6. Deploy ke GitHub Pages.
  - Menggunakan `cancel-in-progress: true` agar deployment lama dibatalkan jika ada push baru — mencegah deployment race condition.

### 7.2 GitHub Pages

- **URL Produksi:** `https://bsweri.github.io/map-data-mining/`
- **Peran:** Platform hosting static site gratis untuk frontend.
- **Mengapa digunakan:**
  - Gratis dan terintegrasi langsung dengan GitHub repository.
  - Cocok untuk hosting SPA (Single Page Application) berbasis React.
  - `vite.config.ts` dikonfigurasi dengan `base: '/map-data-mining/'` agar asset path sesuai dengan subdirectory GitHub Pages.

---

## 8. Tooling dan Code Quality

### 8.1 OxLint

- **Versi:** `^1.69.0`
- **Konfigurasi:** `.oxlintrc.json`
- **Peran:** JavaScript/TypeScript linter yang sangat cepat (ditulis dalam Rust).
- **Mengapa digunakan:**
  - Jauh lebih cepat dari ESLint (hingga 50–100x) karena dibangun dengan Rust.
  - Plugin aktif: `react`, `typescript`, `oxc`.
  - Rules kritis yang diaktifkan:
    - `react/rules-of-hooks: error` — Mencegah penggunaan React Hooks di luar komponen atau dengan kondisi (kondisional).
    - `react/only-export-components: warn` — Best practice untuk Hot Module Replacement (HMR).
  - Dijalankan via `npm run lint`.

### 8.2 Autoprefixer + PostCSS

- **Versi:** `autoprefixer ^10.5.2`, `postcss ^8.5.15`
- **Peran:** Prosesor CSS post-build untuk kompatibilitas lintas browser.
- **Mengapa digunakan:**
  - Autoprefixer otomatis menambahkan vendor prefix CSS (`-webkit-`, `-moz-`, dll.) berdasarkan target browser.
  - Memastikan animasi, gradient, dan properti CSS modern bekerja di semua browser tanpa penulisan prefix manual.

### 8.3 Supabase CLI

- **Peran:** Command-line tool untuk manajemen proyek Supabase secara lokal.
- **Mengapa digunakan:**
  - Mengelola dan menjalankan **migrasi database** secara versioned (13 file migrasi tersimpan di `supabase/migrations/`).
  - Development dan testing Edge Functions secara lokal sebelum deploy ke produksi.
  - Sinkronisasi skema database antara lingkungan lokal dan produksi Supabase Cloud.

---

## 9. Struktur Direktori

```
LookinMaps/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD pipeline
├── .agents/                        # Konfigurasi AI agent
├── public/                         # Asset statis (favicon, dll)
├── src/
│   ├── assets/                     # Gambar dan asset statis
│   ├── components/                 # Komponen UI yang reusable
│   │   ├── AdSenseBanner.tsx       # Komponen banner iklan AdSense
│   │   ├── DataGrid.tsx            # Tabel/grid tampilan data hasil
│   │   ├── ExportButton.tsx        # Tombol ekspor ke Excel
│   │   ├── Footer.tsx              # Footer global aplikasi
│   │   ├── Header.tsx              # Header navigasi publik
│   │   ├── LanguageCurrencySwitcher.tsx  # Switcher bahasa & mata uang
│   │   ├── PricingPackages.tsx     # Komponen kartu paket harga
│   │   ├── ProtectedRoute.tsx      # HOC untuk route yang butuh auth/admin
│   │   └── SearchForm.tsx          # Form pencarian ekstraksi data
│   ├── contexts/
│   │   └── AuthContext.tsx         # React Context untuk state autentikasi global
│   ├── lib/
│   │   ├── supabase.ts             # Inisialisasi Supabase client (singleton)
│   │   └── quota.ts                # Utilitas manajemen kuota harian (localStorage)
│   ├── locales/
│   │   ├── en/translation.json     # Terjemahan Bahasa Inggris
│   │   └── id/translation.json     # Terjemahan Bahasa Indonesia
│   ├── pages/
│   │   ├── Home.tsx                # Landing page utama
│   │   ├── Login.tsx               # Halaman login
│   │   ├── Register.tsx            # Halaman registrasi
│   │   ├── Pricing.tsx             # Halaman harga paket
│   │   ├── Profile.tsx             # Halaman profil pengguna
│   │   ├── ContactUs.tsx           # Halaman kontak & form pesan
│   │   ├── UserDashboard.tsx       # Dashboard utama pengguna (39KB - halaman terbesar)
│   │   └── admin/
│   │       ├── AdminLayout.tsx     # Layout wrapper untuk panel admin
│   │       ├── DashboardOverview.tsx  # Overview statistik untuk admin
│   │       ├── ManageUsers.tsx     # Manajemen pengguna oleh admin
│   │       ├── PricingSettings.tsx # Pengaturan harga paket membership
│   │       ├── GlobalSettings.tsx  # Pengaturan global aplikasi
│   │       └── Inbox.tsx           # Kotak masuk pesan dari Contact Us
│   ├── App.tsx                     # Root component dengan routing definition
│   ├── main.tsx                    # Entry point aplikasi React
│   ├── i18n.ts                     # Konfigurasi i18next (multi-bahasa)
│   ├── types.ts                    # Type definitions TypeScript global
│   ├── index.css                   # Global CSS & Tailwind directives
│   └── App.css                     # CSS aplikasi utama
├── supabase/
│   ├── config.toml                 # Konfigurasi Supabase CLI lokal
│   ├── functions/
│   │   ├── search-maps/            # Edge function: ekstraksi data Google Maps
│   │   ├── create-midtrans-transaction/  # Edge function: buat transaksi Midtrans
│   │   ├── midtrans-webhook/       # Edge function: terima notifikasi Midtrans
│   │   └── lemonsqueezy-webhook/   # Edge function: terima notifikasi LemonSqueezy
│   └── migrations/                 # 13 file SQL migrasi database versioned
├── .env                            # Environment variables (Supabase URL & Anon Key)
├── .oxlintrc.json                  # Konfigurasi OxLint
├── package.json                    # Dependencies & npm scripts
├── tsconfig.app.json               # Konfigurasi TypeScript untuk aplikasi
├── vite.config.ts                  # Konfigurasi Vite build tool
└── index.html                      # Entry HTML (Vite entry point)
```

---

## 10. Alur Data Sistem

### Alur Ekstraksi Data (Core Feature)

```
Pengguna mengisi form (keyword, lokasi, radius)
                   |
                   v
          SearchForm.tsx
   - Validasi input (keyword & lokasi wajib diisi)
   - Cek kuota lokal (localStorage via quota.ts)
                   |
                   v  POST /functions/v1/search-maps
                   |  Header: Authorization Bearer [JWT]
                   |  Body: { keyword, location, radius, min_rating, phone_only }
                   |
    Supabase Edge Function: search-maps
      - Verifikasi JWT (jika user login)
      - Panggil Google Maps / Places API
      - Filter hasil (rating, ketersediaan telepon)
      - Log penggunaan ke tabel api_usage_logs
      - Return: Array data bisnis
                   |
                   v
        UserDashboard.tsx (State Management)
      - Update state data[]
      - Increment quota di localStorage (Free user)
      - Render kartu bisnis melalui DataGrid
                   |
                   v  (Opsional)
           ExportButton.tsx
      - Konversi data[] ke worksheet Excel (xlsx library)
      - Auto-download file .xlsx ke komputer pengguna
```

### Alur Pembayaran Midtrans

```
User klik "Upgrade Plan"
                   |
                   v  POST /functions/v1/create-midtrans-transaction
      Frontend mengirim: { plan_level, duration_months, user_id }
                   |
                   v
    Edge Function: create-midtrans-transaction
      - Validasi user session (JWT)
      - Ambil harga dari tabel membership_plans
      - Buat transaksi di Midtrans API (server-side, dengan secret key)
      - Simpan transaksi pending di tabel transactions
      - Return: { snap_token }
                   |
                   v
     Frontend: window.snap.pay(snap_token)
      - Popup Midtrans terbuka
      - User memilih metode bayar & melakukan pembayaran
                   |
                   v  [Webhook dari Midtrans]
     Edge Function: midtrans-webhook
      - Verifikasi signature request dari Midtrans
      - Update transactions.status = 'success'
      - Update profiles.current_membership
      - Update profiles.membership_expires_at
```

---

## 11. Sistem Peran dan Akses RBAC

```
+------------------------------------------------------+
|                    ROLE HIERARCHY                    |
|                                                      |
|  Guest (Tidak Login)                                 |
|     Akses: Home, Login, Register, Pricing            |
|     Dashboard: DITOLAK (redirect ke /login)          |
|                                                      |
|  User (Role: 'user') - Default setelah register      |
|     Akses: /dashboard, /profile, /contact            |
|     Membership: Free / Silver / Gold / Platinum      |
|     Admin Panel: DITOLAK                             |
|                                                      |
|  Admin (Role: 'admin')                               |
|     Semua akses User                                 |
|     Admin Panel (/admin/*)                           |
|     Kelola Pengguna (ManageUsers)                    |
|     Pengaturan Harga (PricingSettings)               |
|     Pengaturan Global (GlobalSettings)               |
|     Inbox pesan Contact Us                           |
+------------------------------------------------------+
```

**Implementasi RBAC:**
- `ProtectedRoute.tsx` memeriksa `profile.role` dari `AuthContext` sebelum me-render halaman. Prop `requireAdmin={true}` digunakan pada rute `/admin`.
- PostgreSQL **Row Level Security (RLS)** memastikan query database hanya mengembalikan data yang sesuai dengan role dan `user_id` pengguna yang sedang login.
- Admin dapat melihat **semua data** (transaksi, log, profil pengguna) sedangkan user biasa hanya melihat data miliknya sendiri.

---

## 12. Sistem Kuota dan Monetisasi

### Tingkatan Membership

| Level | Harga IDR | Harga USD | Kuota Harian | Kuota Bulanan |
|---|---|---|---|---|
| **Free** | Gratis | Gratis | 10 request | 100 request |
| **Silver** | Rp 99.000 | $6.99 | 100 request | 3.000 request |
| **Gold** | Rp 169.000 | $11.99 | 500 request | 15.000 request |
| **Platinum** | Rp 299.000 | $19.99 | 2.000 request | 60.000 request |

### Implementasi Kuota

- **Free User (tanpa login):** Kuota dibatasi di sisi client menggunakan `localStorage`. File `src/lib/quota.ts` menyimpan jumlah pemakaian harian (`FREE_DAILY_LIMIT = 10`) dengan key yang ter-reset setiap hari secara otomatis.
- **Paid User (dengan login):** Kuota dikelola di sisi server (database `profiles.credits`). Setiap request yang berhasil mendecrements kredit melalui Edge Function `search-maps`.
- **Progress Bar Kuota:** Divisualisasikan di sidebar dashboard, berubah warna merah jika kuota tersisa `<= 1` untuk memberikan peringatan visual.
- **Discount sistem:** Pembelian paket dengan durasi lebih lama mendapat diskon otomatis (1 bulan: 0%, 3 bulan: 25%, 6 bulan: 30%, 12 bulan: 35%).

---

## Ringkasan Teknologi

| Kategori | Teknologi | Versi | Peran |
|---|---|---|---|
| UI Framework | React | 19 | Core frontend library |
| Bahasa | TypeScript | ~6.0 | Type safety & developer experience |
| Build Tool | Vite | 8 | Bundler & dev server ultra-cepat |
| CSS Framework | Tailwind CSS | 4 | Utility-first styling |
| Routing | React Router DOM | 7 | SPA Navigation & Protected Routes |
| Backend / BaaS | Supabase | Latest | Auth, Database, Edge Functions |
| Database | PostgreSQL | 17 | Relational database dengan RLS |
| Serverless Runtime | Deno | Latest | Runtime Edge Functions Supabase |
| Icon Library | Lucide React | 1.21 | SVG icon components |
| Maps SDK | @react-google-maps/api | 2.20 | Google Maps integration |
| i18n | i18next + react-i18next | 26 / 17 | Multi-language (EN & ID) |
| Excel Export | xlsx | 0.18 | Client-side .xlsx generation |
| Payment IDR | Midtrans Snap | - | Indonesian payment gateway |
| Payment USD | LemonSqueezy | - | International payment platform |
| Linter | OxLint | 1.69 | Fast Rust-based linting |
| CI/CD | GitHub Actions | - | Auto deploy pipeline |
| Hosting | GitHub Pages | - | Static site hosting (free) |

---

*Dokumen ini dibuat berdasarkan analisis kode sumber proyek GeoExtract (LookinMaps) pada 22 Juli 2026.*
