# GetJob — Frontend

Antarmuka web modern untuk platform rekrutmen GetJob, dibangun dengan Next.js 14, React, dan TypeScript. Menampilkan autentikasi passwordless, gesture-based photo capture, kanban ATS untuk employer, dan dashboard berbasis peran.

**Status**: ✅ Production Ready | **Version**: 3.0.0 | **Last Updated**: May 2026

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Changelog](#-changelog)
3. [Key Features](#-key-features)
4. [Tech Stack](#️-tech-stack)
5. [Project Structure](#-project-structure)
6. [Application Flow](#-application-flow)
7. [Environment Setup](#-environment-setup)
8. [Deployment](#-deployment)

---

## 🚀 Quick Start

### Prerequisites

Node.js v18+ dan npm.

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Pastikan NEXT_PUBLIC_API_BASE_URL mengarah ke backend

# 3. Jalankan development server
npm run dev
```

Buka `http://localhost:3000`.

---

## 📝 Changelog

### v3.0.0 — May 2026 (Employer ATS Kanban)

**Fitur Baru**

- **Employer Dashboard** (`/employer/dashboard`): Dashboard khusus untuk role `EMPLOYER`, terpisah dari admin dan kandidat.
- **Kanban Board ATS**: Board 6 kolom (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED`) untuk manajemen pipeline rekrutmen secara visual.
- **Drag-and-Drop**: Menggunakan `@hello-pangea/dnd` untuk memindahkan aplikasi antar kolom dengan optimistic update dan rollback otomatis jika gagal.
- **Application Detail Modal**: Modal detail aplikasi dengan field catatan internal (notes) yang bisa diedit employer.
- **Job Search & Filter**: Komponen pencarian lowongan dengan filter keyword, tipe pekerjaan, dan rentang gaji. Tersedia untuk kandidat dan publik.
- **RBAC Update**: Middleware `middleware.ts` diperbarui untuk menangani routing role `EMPLOYER` ke `/employer/dashboard`.

---

### v2.0.0 — April 2026

- **Email Verification Flow**: Halaman dan logika untuk verifikasi email sebelum akses fitur utama
- **Default Password Modal**: Modal yang muncul otomatis saat login pertama via magic link, meminta user mengubah password default
- **Profile Page** (`/profile`): Halaman manajemen profil — update nama dan ganti password
- **Check Email Page** (`/check-email`): Halaman konfirmasi setelah request magic link
- **Apply Success Page** (`/apply-success`): Halaman feedback setelah berhasil apply

---

### v1.0.0 — Initial Release

- Autentikasi tradisional (login dengan email + password)
- Magic Link login & register (passwordless)
- RBAC: routing otomatis ke `/admin/home` (ADMIN) atau `/home` (CANDIDATE)
- Admin dashboard: buat, edit, hapus lowongan; lihat aplikasi masuk
- Candidate dashboard: browse lowongan, apply dengan form dinamis
- Gesture-based photo capture menggunakan TensorFlow.js + MediaPipe
- Dynamic form builder dari backend JSON schema
- TanStack React Query untuk caching dan state sinkronisasi

---

## 🚀 Key Features

- **Magic Link Authentication**: Login dan register passwordless via one-time link di email.
- **Role-Based Access Control (RBAC)**: Tiga dashboard terpisah untuk `ADMIN`, `EMPLOYER`, dan `CANDIDATE`, dilindungi oleh Next.js Edge Middleware dan JWT parsing.
- **Employer Kanban ATS**: Board drag-and-drop 6 kolom untuk mengelola pipeline rekrutmen secara visual dengan optimistic updates.
- **Gesture-Based Photo Capture**: Kandidat bisa mengambil foto dokumen atau selfie hanya dengan menunjukkan 3 jari ke webcam — menggunakan TensorFlow.js Hand Pose + MediaPipe.
- **Dynamic Application Forms**: Form aplikasi dirender secara dinamis berdasarkan skema JSON dari backend, tanpa hardcode field di frontend.
- **Job Search & Filtering**: Pencarian lowongan berdasarkan keyword, tipe pekerjaan, dan rentang gaji dengan pagination.
- **Performance & Caching**: TanStack React Query untuk data fetching, caching, dan sinkronisasi state dengan REST API.
- **Responsive UI**: Tailwind CSS + Shadcn/UI + Radix UI — aksesibel, bersih, dan interaktif di semua ukuran layar.

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, PostCSS, CVA, clsx |
| UI Components | Shadcn/UI, Radix UI, Lucide React |
| State Management | TanStack React Query (server), Zustand (client) |
| Forms & Validation | React Hook Form, Zod |
| Drag-and-Drop | @hello-pangea/dnd |
| AI/Gesture | TensorFlow.js, MediaPipe Hands, react-webcam |
| HTTP Client | Axios + JWT interceptor |
| Auth Utilities | JS Cookie, JWT Decode |
| Deployment | Vercel |

---

## 📂 Project Structure

```text
fe-hiring-platform/
├── app/
│   ├── (auth)/                   # Halaman publik (tidak perlu login)
│   │   ├── magic-login/          # Verifikasi magic link login
│   │   ├── magic-signup/         # Verifikasi magic link register
│   │   ├── signup/               # Registrasi kandidat
│   │   └── page.tsx              # Halaman login utama
│   ├── (main)/                   # Halaman terproteksi
│   │   ├── _components/          # Layout: Header, Sidebar, ApplyForm
│   │   ├── admin/                # Dashboard Admin
│   │   │   ├── _components/      # Form & komponen khusus admin
│   │   │   ├── home/             # Ringkasan dashboard admin
│   │   │   └── job-list/         # Manajemen lowongan oleh admin
│   │   ├── employer/             # Dashboard Employer (v3)
│   │   │   ├── dashboard/        # Kanban ATS board
│   │   │   └── _components/      # KanbanBoard, ApplicationCard, dll
│   │   ├── home/                 # Dashboard kandidat
│   │   ├── job-list/             # Daftar & pencarian lowongan kandidat
│   │   └── profile/              # Manajemen profil user
│   ├── apply-success/            # Halaman sukses setelah apply
│   ├── check-email/              # Konfirmasi setelah request magic link
│   ├── globals.css
│   ├── layout.tsx
│   └── middleware.ts             # Edge middleware RBAC routing
├── components/                   # Komponen UI generik (Shadcn, Modal)
├── context/                      # React Context (Auth, Theme, Query)
├── hooks/                        # Custom hooks (use-toast, use-mobile, use-debounce)
├── lib/
│   ├── api.ts                    # Semua binding Axios API
│   └── axios-client.ts           # Axios interceptor (token refresh)
├── public/                       # Aset statis
├── schemas/                      # Zod validation schemas
├── types/                        # TypeScript type definitions
└── package.json
```

---

## 🌊 Application Flow

### 1. Authentication Flow

- User mengunjungi app → `middleware.ts` memeriksa `access_token` di cookie
- Jika belum login → diarahkan ke halaman auth (`app/(auth)`)
- **Standard Login**: Submit form → backend → set cookie JWT
- **Magic Link**: Input email → backend kirim email → user klik link → `magic-login/verify?code=XXX` → token di-set
- **RBAC Redirect**: Setelah login, `CANDIDATE` → `/home`, `ADMIN` → `/admin/home`, `EMPLOYER` → `/employer/dashboard`

### 2. Employer Flow (v3)

- Employer login → diarahkan ke `/employer/dashboard`
- Dashboard menampilkan kanban board dengan 6 kolom status
- Employer bisa drag-and-drop kartu aplikasi antar kolom
- Klik kartu → modal detail dengan info kandidat dan field catatan
- Employer bisa membuat, mengedit, dan menghapus lowongan miliknya via `/employer/jobs`
- `SearchInput` menggunakan debounce 300ms untuk pencarian real-time
- `FilterPanel` menyediakan dropdown job type dan salary range slider

### 3. Admin Flow

- Admin login → `/admin/home` (ringkasan statistik)
- `/admin/job-list`: buat lowongan baru via `JobForm.tsx`, lihat dan kelola aplikasi masuk
- Admin menentukan field form yang wajib/opsional saat membuat lowongan (misal: `photoProfile`, `phoneNumber`)

### 4. Candidate Flow

- Kandidat login → `/home`
- `/job-list`: browse dan cari lowongan, filter berdasarkan tipe dan gaji
- Klik "Apply" → `ApplyFormModal.tsx` dengan `ApplyForm.tsx` yang dirender dinamis sesuai skema lowongan
- Jika foto diperlukan → `GestureCameraModal.tsx` aktifkan webcam, TensorFlow mendeteksi 3 jari → foto diambil otomatis

---

## 🔧 Environment Setup

```bash
# URL backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api/v1

# URL frontend (untuk redirect)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🚢 Deployment

### Vercel

```bash
# Deploy otomatis saat push ke main
git push origin main
```

Environment variables yang wajib diset di Vercel dashboard:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### Scripts

```bash
npm run dev     # Development server (http://localhost:3000)
npm run build   # Build production
npm start       # Jalankan production server
npm run lint    # Lint dengan ESLint
```

---

## 🗺️ Roadmap

Mengikuti roadmap backend. Fase frontend yang relevan:

| Phase | Nama | Status |
|-------|------|--------|
| 1 | MVP Foundation (Auth, Jobs, Applications, Gesture) | ✅ Complete |
| 3 | Automated Testing (Vitest + Playwright E2E) | ⏳ Planned |
| 4 | Admin Dashboard & Analytics (kanban, bulk actions, CSV export) | ⏳ Planned |
| 5 | Candidate Portal (saved jobs, status timeline, notifikasi) | ⏳ Planned |
| 6 | Mobile Native Apps (React Native) | ⏳ Planned |
| 11 | Performance Optimization (Lighthouse >90, code splitting) | ⏳ Planned |
| 12 | Internationalization (5+ bahasa, RTL) | ⏳ Planned |

**Fitur yang sengaja tidak diimplementasikan di v3.0**: real-time sync, AI matching, interview scheduling, employer branding, candidate messaging, saved jobs, dan bulk status update.

---

**GetJob Team — May 2026**
