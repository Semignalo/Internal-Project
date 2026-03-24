# STARINC OS — Frontend

Aplikasi frontend untuk STARINC OS, dibangun dengan Next.js 16, React 19, TypeScript, dan Tailwind CSS.

## Halaman & Fitur

| Route | Halaman | Fitur Utama |
|-------|---------|-------------|
| `/` | Dashboard | Metrik ringkasan, health proyek aktif, beban kerja tim |
| `/projects` | Proyek | Daftar proyek, filter status, buat/edit/hapus proyek |
| `/tasks` | Tugas | Kanban board drag-and-drop, subtask, lampiran, revisi |
| `/workload` | Beban Kerja | Matriks kapasitas tim, deteksi overload |
| `/settings` | Pengaturan | Manajemen pengguna dan konfigurasi sistem |
| `/login` | Login | Autentikasi email & password |

## Struktur Direktori

```
src/
├── app/
│   ├── layout.tsx          # Root layout dengan font dan metadata
│   ├── page.tsx            # Halaman dashboard
│   ├── login/              # Halaman login
│   ├── projects/           # Halaman manajemen proyek
│   ├── tasks/              # Halaman kanban board tugas
│   ├── workload/           # Halaman beban kerja tim
│   └── settings/           # Halaman pengaturan sistem
└── components/
    └── layout/
        ├── AppLayout.tsx   # Layout utama dengan sidebar & topbar
        ├── Sidebar.tsx     # Menu navigasi samping
        └── Topbar.tsx      # Header mobile
```

## Setup & Pengembangan

Pastikan backend berjalan di `http://localhost:5000` sebelum memulai frontend.

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Build untuk Produksi

```bash
npm run build
npm run start
```

## Linting

```bash
npm run lint
```

## Tech Stack

- **Next.js 16** — React framework dengan App Router
- **React 19** — UI library
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **dnd-kit** — Drag-and-drop untuk Kanban board
- **react-hook-form** — Manajemen form
- **lucide-react** — Icon library
