---
description: Deploy / update project to TrueNAS server via SSH
---

# Deploy ke TrueNAS

## Langkah 1 — Push perubahan lokal ke GitHub

```bash
git add .
git commit -m "your commit message here"
git push origin main
```

## Langkah 2 — SSH ke TrueNAS server

```bash
ssh root@<IP_TRUENAS>
# atau jika pakai user lain:
ssh <username>@<IP_TRUENAS>
```

## Langkah 3 — Masuk ke folder project di server

```bash
cd /mnt/<pool-name>/projects/Internal-Project
# Sesuaikan path dengan lokasi project di TrueNAS
```

## Langkah 4 — Pull kode terbaru dari GitHub

```bash
git pull origin main
```

## Langkah 5 — Rebuild dan restart Docker containers

Jika ada perubahan pada backend (schema, kode, dependencies):
```bash
docker-compose down
docker-compose build backend
docker-compose up -d
```

Jika hanya perubahan frontend (tidak ada container frontend):
> Frontend adalah static build via Next.js. Rebuild jika ada perubahan frontend.

## Langkah 6 — Cek status container

```bash
docker-compose ps
docker-compose logs backend --tail=50
```

---

## Catatan Penting

- **Database**: PostgreSQL berjalan di container `starinc-postgres`, data tersimpan di Docker volume `pgdata` (tidak hilang saat rebuild)
- **Uploads**: File upload tersimpan di Docker volume `uploads` (tidak hilang saat rebuild)
- **Schema**: `prisma/schema.prisma` = PostgreSQL (production). `prisma/schema.sqlite.prisma` = SQLite (lokal saja)
- **Seed**: Hanya jalankan seed jika database kosong/baru: `docker-compose exec backend npx prisma db seed`

## Menjalankan lokal (tanpa Docker)

```bash
# Di folder backend:
npm run start:local         # generate SQLite client + jalankan dev server
npm run prisma:local:push   # push schema SQLite ke dev.db
npm run prisma:local:seed   # seed data ke SQLite
```
