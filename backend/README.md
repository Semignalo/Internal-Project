# STARINC OS — Backend

API backend untuk STARINC OS, dibangun dengan NestJS 11, TypeScript, dan Prisma ORM.

## Modul & Endpoint API

### Users — `/users`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/users` | Buat pengguna baru |
| POST | `/users/login` | Login pengguna |
| GET | `/users` | Daftar semua pengguna |
| GET | `/users/:id` | Detail pengguna |
| PATCH | `/users/:id` | Update pengguna |
| DELETE | `/users/:id` | Hapus pengguna |

### Projects — `/projects`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/projects` | Buat proyek baru |
| GET | `/projects` | Daftar semua proyek |
| GET | `/projects/:id` | Detail proyek |
| PATCH | `/projects/:id` | Update proyek |
| DELETE | `/projects/:id` | Hapus proyek |

### Divisions — `/divisions`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/divisions` | Buat divisi baru |
| GET | `/divisions` | Daftar semua divisi |
| GET | `/divisions/:id` | Detail divisi |
| PATCH | `/divisions/:id` | Update divisi |
| DELETE | `/divisions/:id` | Hapus divisi |

### Tasks — `/tasks`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/tasks` | Buat tugas baru |
| GET | `/tasks` | Daftar semua tugas |
| GET | `/tasks/:id` | Detail tugas |
| PATCH | `/tasks/:id` | Update tugas |
| DELETE | `/tasks/:id` | Hapus tugas |
| POST | `/tasks/:id/subtasks` | Tambah subtask |
| PATCH | `/tasks/subtasks/:subtaskId` | Update subtask |
| DELETE | `/tasks/subtasks/:subtaskId` | Hapus subtask |
| POST | `/tasks/:id/attachments` | Upload lampiran |
| DELETE | `/tasks/attachments/:attachmentId` | Hapus lampiran |

### Dashboard — `/dashboard`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/dashboard` | Metrik agregat sistem |

## Struktur Direktori

```
src/
├── app.module.ts           # Root module
├── app.controller.ts       # Dashboard controller
├── app.service.ts          # Dashboard service (aggregasi metrik)
├── main.ts                 # Entry point
├── prisma/                 # PrismaService
├── users/                  # Modul pengguna
├── projects/               # Modul proyek
├── divisions/              # Modul divisi
└── tasks/                  # Modul tugas (termasuk subtask & lampiran)
```

## Database (Prisma + PostgreSQL)

Model utama:
- **User** — pengguna sistem
- **Project** — proyek dengan manager dan divisi
- **Division** — tahap alur kerja dalam proyek
- **Task** — tugas dengan assignee, subtask, lampiran, dan log revisi
- **ProjectTemplate** — template proyek yang dapat digunakan ulang

## Setup & Pengembangan

```bash
npm install
```

Salin `.env.example` ke `.env` dan isi variabel koneksi database.

```bash
# Generate Prisma client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev

# Jalankan server development
npm run start:dev
```

API tersedia di [http://localhost:5000](http://localhost:5000).

## Build untuk Produksi

```bash
npm run build
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Linting

```bash
npm run lint
```
