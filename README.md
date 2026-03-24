# STARINC OS — Internal Project

**STARINC OS** adalah sistem operasional internal untuk creative agency, yang mencakup manajemen proyek, pelacakan tugas, pemantauan beban kerja tim, dan manajemen pengguna.

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Fitur Aplikasi](#fitur-aplikasi)
- [Cara Menjalankan](#cara-menjalankan)
- [Fitur GitHub Copilot Coding Agent](#fitur-github-copilot-coding-agent)

---

## Tentang Proyek

STARINC OS dirancang untuk membantu tim kreatif mengelola alur kerja dari tahap perencanaan hingga penyelesaian proyek. Sistem ini mendukung hierarki proyek → divisi → tugas, pelacakan revisi, lampiran file, dan visualisasi kapasitas tim.

---

## Teknologi yang Digunakan

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, dnd-kit |
| Backend | NestJS 11, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Deployment | Docker Compose |

---

## Fitur Aplikasi

| Halaman | Deskripsi |
|---------|-----------|
| **Dashboard** | Ringkasan metrik (proyek aktif, tugas tertunda, kecepatan tim) |
| **Projects** | Manajemen proyek dengan filter status dan pelacakan progres |
| **Tasks** | Kanban board dengan drag-and-drop, subtask, lampiran, dan revisi |
| **Workload** | Matriks beban kerja tim dan deteksi overload |
| **Settings** | Konfigurasi sistem, manajemen pengguna, dan penetapan peran |

---

## Cara Menjalankan

### Prasyarat

- Docker & Docker Compose
- Node.js 20+

### Menggunakan Docker Compose

```bash
docker compose up --build
```

Layanan yang berjalan:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

### Menjalankan Secara Terpisah

**Backend:**

```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## Fitur GitHub Copilot Coding Agent

GitHub Copilot Coding Agent adalah agen AI yang dapat bekerja secara mandiri untuk membantu pengembangan perangkat lunak. Berikut adalah penjelasan lengkap fitur-fitur yang dapat dilakukan oleh Copilot Agent dalam konteks proyek ini.

---

### 1. 🔍 Eksplorasi & Pemahaman Kode (*Code Exploration*)

Copilot Agent dapat **menjelajahi seluruh struktur repositori** dan memahami kode secara mendalam sebelum membuat perubahan apa pun.

**Yang dapat dilakukan:**
- Membaca dan memahami semua file dalam repositori (frontend, backend, konfigurasi)
- Mengidentifikasi pola arsitektur yang digunakan (misalnya: NestJS modules, Next.js App Router)
- Menemukan file dan fungsi yang relevan melalui pencarian kode (grep/glob)
- Memahami hubungan antar modul, komponen, dan layanan
- Menganalisis skema database Prisma dan relasi antar entitas

**Contoh dalam proyek ini:**
- "Di mana logika kalkulasi progres proyek berada?"
- "Tampilkan semua endpoint API yang tersedia"
- "Bagaimana alur autentikasi bekerja?"

---

### 2. 🛠️ Pembuatan Kode (*Code Generation*)

Copilot Agent dapat **menulis kode baru** yang konsisten dengan gaya dan konvensi yang sudah ada di proyek.

**Yang dapat dilakukan:**
- Membuat komponen React/Next.js baru berdasarkan pola yang sudah ada
- Menambahkan endpoint API baru di NestJS (controller, service, DTO, module)
- Membuat migration database Prisma
- Menulis fungsi utilitas dan helper
- Membuat tipe TypeScript (interface, type, enum)
- Menambahkan validasi data menggunakan pola yang sudah digunakan di proyek

**Contoh dalam proyek ini:**
- "Buat halaman baru untuk laporan keuangan proyek"
- "Tambahkan endpoint API untuk mengekspor data proyek ke CSV"
- "Buat komponen modal baru untuk konfirmasi penghapusan"

---

### 3. 🐛 Perbaikan Bug (*Bug Fixing*)

Copilot Agent dapat **mengidentifikasi dan memperbaiki bug** dalam kode yang ada.

**Yang dapat dilakukan:**
- Menganalisis pesan error dan stack trace
- Menemukan penyebab bug di antara beberapa file yang saling terkait
- Memperbaiki bug logika, tipe data, atau alur kontrol
- Menyelesaikan masalah race condition atau state management
- Memperbaiki masalah integrasi antara frontend dan backend

**Contoh dalam proyek ini:**
- "Kalkulasi persentase progres tidak akurat ketika ada divisi tanpa tugas"
- "Filter tugas 'My Tasks' menampilkan tugas milik pengguna lain"
- "Upload lampiran gagal untuk file berukuran lebih dari 5MB"

---

### 4. ♻️ Refaktorisasi Kode (*Code Refactoring*)

Copilot Agent dapat **merestrukturisasi kode** yang sudah ada untuk meningkatkan keterbacaan, pemeliharaan, dan performa tanpa mengubah perilaku.

**Yang dapat dilakukan:**
- Memecah komponen besar menjadi komponen-komponen kecil yang reusable
- Mengekstrak logika bisnis ke dalam custom hooks atau service terpisah
- Mengganti pola kode yang sudah usang dengan pola modern
- Menyatukan kode yang duplikat (DRY principle)
- Meningkatkan tipe TypeScript untuk keamanan tipe yang lebih baik

**Contoh dalam proyek ini:**
- "Refaktor TaskDetailModal.tsx yang sudah terlalu panjang menjadi beberapa komponen"
- "Ekstrak logika fetch data ke dalam custom React hooks"
- "Standarisasi penanganan error di semua service NestJS"

---

### 5. 🧪 Pembuatan Test (*Test Generation*)

Copilot Agent dapat **menulis test otomatis** untuk memvalidasi fungsionalitas kode.

**Yang dapat dilakukan:**
- Membuat unit test untuk service dan controller NestJS
- Menulis integration test untuk endpoint API
- Membuat test komponen React dengan React Testing Library
- Menambahkan test untuk edge case dan skenario error
- Memastikan test konsisten dengan konfigurasi testing yang sudah ada

**Contoh dalam proyek ini:**
- "Buat unit test untuk TasksService.recalculateProgress()"
- "Tambahkan integration test untuk endpoint POST /tasks"
- "Tulis test untuk komponen CreateTaskModal"

---

### 6. 📋 Peninjauan & Analisis PR (*Pull Request Review*)

Copilot Agent dapat **menganalisis perubahan kode** dalam pull request dan memberikan umpan balik.

**Yang dapat dilakukan:**
- Mengidentifikasi potensi bug dalam perubahan kode
- Memeriksa konsistensi dengan konvensi kode yang ada
- Mendeteksi kerentanan keamanan
- Memberikan saran untuk peningkatan performa
- Memastikan test yang memadai untuk perubahan baru

---

### 7. 🔒 Pemeriksaan Keamanan (*Security Analysis*)

Copilot Agent dapat **mengidentifikasi dan memperbaiki kerentanan keamanan**.

**Yang dapat dilakukan:**
- Menjalankan analisis keamanan statis (CodeQL)
- Memeriksa kerentanan pada dependensi (advisory database)
- Mengidentifikasi injeksi SQL, XSS, CSRF, dan masalah keamanan umum lainnya
- Memastikan data sensitif tidak diekspos dalam log atau response API
- Memeriksa implementasi autentikasi dan otorisasi

**Contoh dalam proyek ini:**
- "Periksa apakah endpoint API memvalidasi input dengan benar"
- "Pastikan password pengguna di-hash sebelum disimpan ke database"
- "Periksa apakah ada data sensitif yang terekspos di response API"

---

### 8. 🚀 Investigasi CI/CD & Build (*CI/CD Investigation*)

Copilot Agent dapat **menganalisis kegagalan build dan CI/CD pipeline** di GitHub Actions.

**Yang dapat dilakukan:**
- Membaca log workflow GitHub Actions
- Mengidentifikasi penyebab kegagalan test, build, atau lint
- Memperbaiki masalah konfigurasi CI/CD
- Menganalisis status check pada pull request

---

### 9. 📚 Dokumentasi (*Documentation*)

Copilot Agent dapat **membuat dan memperbarui dokumentasi** proyek.

**Yang dapat dilakukan:**
- Menulis atau memperbarui file README
- Membuat dokumentasi API (endpoint, parameter, response)
- Mendokumentasikan arsitektur sistem dan keputusan desain
- Menambahkan komentar kode yang bermakna
- Membuat panduan setup dan deployment

---

### 10. 🗃️ Manajemen Database (*Database Management*)

Copilot Agent dapat **bekerja dengan skema dan migrasi database**.

**Yang dapat dilakukan:**
- Memodifikasi skema Prisma untuk menambah/mengubah model
- Membuat file migrasi database
- Menulis seed data untuk pengembangan
- Mengoptimalkan query database
- Menambahkan indeks untuk meningkatkan performa query

**Contoh dalam proyek ini:**
- "Tambahkan field `estimatedHours` ke model Task"
- "Buat relasi many-to-many antara Project dan Tag"
- "Optimasi query dashboard yang lambat"

---

### 11. 🔄 Manajemen Dependensi (*Dependency Management*)

Copilot Agent dapat **mengelola dependensi proyek dengan aman**.

**Yang dapat dilakukan:**
- Menambahkan dependensi baru yang diperlukan (npm/pip/dll.)
- Memeriksa kerentanan keamanan pada dependensi yang akan ditambahkan
- Memperbarui dependensi yang sudah ada
- Menghapus dependensi yang tidak digunakan

---

### Cara Menggunakan Copilot Agent

1. **Buat Issue** di repositori ini dengan deskripsi tugas yang ingin diselesaikan
2. **Assign Copilot** pada issue tersebut
3. Copilot Agent akan secara otomatis:
   - Menjelajahi kode yang relevan
   - Membuat rencana perubahan
   - Mengimplementasikan perubahan
   - Membuat Pull Request dengan deskripsi lengkap
4. **Review PR** yang dibuat oleh Copilot dan merge jika sudah sesuai

> **Tips:** Semakin jelas dan spesifik deskripsi issue, semakin akurat hasil yang dihasilkan Copilot Agent. Sertakan konteks seperti nama file, nama fungsi, atau contoh perilaku yang diharapkan.

---

## Kontribusi

Untuk berkontribusi pada proyek ini, buat pull request dengan deskripsi perubahan yang jelas. Pastikan semua test lulus sebelum mengajukan PR.

## Lisensi

Internal use only — Semignalo.
